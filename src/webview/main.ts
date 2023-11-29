import {
  provideVSCodeDesignSystem,
  Button,
  TextField,
  ProgressRing,
  vsCodeButton,
  vsCodeTextField,
  vsCodeProgressRing, 
} from '@vscode/webview-ui-toolkit';

// In order to use the Webview UI Toolkit web components they
// must be registered with the browser (i.e. webview) using the
// syntax below.
//
// To register more toolkit components, simply import the component
// registration function and call it from within the register
// function, like so:
//
// provideVSCodeDesignSystem().register(
//   vsCodeButton(),
//   vsCodeCheckbox()
// );
//
// Finally, if you would like to register all of the toolkit
// components at once, there's a handy convenience function:
//
// provideVSCodeDesignSystem().register(allComponents);
// 
provideVSCodeDesignSystem().register(
  vsCodeButton(),
  vsCodeTextField(),
  vsCodeProgressRing()
);

// Get access to the VS Code API from within the webview context
const vscode = acquireVsCodeApi();

// Just like a regular webpage we need to wait for the webview
// DOM to load before we can reference any of the HTML elements
// or toolkit components
window.addEventListener("load", main);

// Main function that gets executed once the webview DOM loads
function main() {
  // To get improved type annotations/IntelliSense the associated class for
  // a given toolkit component can be imported and used to type cast a reference
  // to the element (i.e. the `as Button` syntax)
  const searchButton = document.getElementById("search-button") as Button;
  searchButton.addEventListener("click", searchWord);
  const wordTextField = document.getElementById("word") as TextField;
  wordTextField.addEventListener("keydown", (event) => {
    if (event.key === "Enter") {
      searchWord();
    }
  });

  setVSCodeMessageListener();
  clearResult();
}

function searchWord() {
  const word = document.getElementById("word") as TextField;
  vscode.postMessage({
    command: "search",
    word: word.value
  });
  displayLoadingState();
}

// Sets up an event listener to listen for messages passed from the extension context
// and executes code based on the message that is recieved
function setVSCodeMessageListener() {
  window.addEventListener("message", (event) => {
    const command = event.data.command;

    switch (command) {
      case "search":
        const dictData = JSON.parse(event.data.payload);
        displayDictionaryData(dictData);
        break;
      case "error":
        displayError(event.data.message);
        break;
    }
  });
}

function displayLoadingState() {
  clearResult();
  const loading = document.getElementById("loading") as ProgressRing;
  const resultMsg = document.getElementById("result-message");
  if (loading && resultMsg) {
    loading.classList.remove("hidden");
    resultMsg.classList.remove("hidden");
    resultMsg.textContent = "Searching...";
  }
}

function clearResult() {
  const resultTitle = document.getElementById("result-title");
  const loading = document.getElementById("loading") as ProgressRing;
  const resultMsg = document.getElementById("result-message");
  const definition = document.getElementById("definition");
  if (resultTitle && loading && resultMsg && definition) {
    resultTitle.classList.add("hidden");
    loading.classList.add("hidden");
    resultMsg.classList.add("hidden");
    definition.classList.add("hidden");
  }
}

function displayError(errorMsg) {
  clearResult();
  const resultMsg = document.getElementById("result-message");
  if (resultMsg) {
    resultMsg.classList.remove("hidden");
    resultMsg.textContent = errorMsg;
  }
}

function displayDictionaryData(dictData) {
  clearResult();
  const resultTitle = document.getElementById("result-title");
  const definition = document.getElementById("definition");
  if (resultTitle && definition) {
    resultTitle.classList.remove("hidden");
    definition.classList.remove("hidden");
    resultTitle.textContent = extractWordAndPhonetic(dictData);
    definition.innerHTML = extractDefinitions(dictData);
  }
}

/**
 * Extract definitions from response data from api.dictionaryapi.dev
 * 
 * @param dictData 
 * @returns 
 */
function extractDefinitions(dictData) {
  var defHtml = "<ol>";
  if (dictData.meanings.length > 0) {
    for (let i = 0; i < dictData.meanings.length; i++) {
      var meaning = dictData.meanings[i];
      var partOfSpeech = meaning.partOfSpeech;
      if (meaning.definitions.length > 0) {
        for (let j = 0; j < meaning.definitions.length; j++) {
          defHtml = defHtml + "<li>[<i>" + partOfSpeech + "</i>] " + meaning.definitions[j].definition;
          if (meaning.definitions[j].example !== undefined) {
            defHtml = defHtml + "<br/>e.g. " + meaning.definitions[j].example;
          }
        }
        defHtml = defHtml + "</li>";
      }      
    }
  }
  return defHtml + "</ol>";
}

/**
 * Extract word and phonetic from response data from api.dictionaryapi.dev
 * @param dictData 
 * @returns 
 */
function extractWordAndPhonetic(dictData) {
  var wordAndPhonetic = dictData.word;
  if (dictData.phonetic !== undefined) {
    return wordAndPhonetic + " " + dictData.phonetic;
  } else if (dictData.phonetics.length > 0) {
    for (let i = 0; i < dictData.phonetics.length; i++) {
      if (dictData.phonetics[i].text !== undefined) {
        return wordAndPhonetic + " " + dictData.phonetics[i].text;
      }
    }
  }
  return wordAndPhonetic;
}