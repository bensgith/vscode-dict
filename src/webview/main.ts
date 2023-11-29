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
  const loading = document.getElementById("loading") as ProgressRing;
  const definition = document.getElementById("definition");
  if (loading && definition) {
    loading.classList.remove("hidden");
    definition.classList.remove("hidden");
    definition.innerHTML = "<p>Searching...</p>";
  }
}

function displayError(errorMsg) {
  const loading = document.getElementById("loading") as ProgressRing;
  const definition = document.getElementById("definition");
  const resultTitle = document.getElementById("result-title");
  if (loading && definition && resultTitle) {
    loading.classList.add("hidden");
    resultTitle.classList.add("hidden");
    definition.textContent = errorMsg;
  }
}

function displayDictionaryData(dictData) {
  const loading = document.getElementById("loading") as ProgressRing;
  const resultTitle = document.getElementById("result-title");
  const definition = document.getElementById("definition");
  if (loading && resultTitle && definition) {
    loading.classList.add("hidden");
    resultTitle.classList.remove("hidden");
    definition.classList.remove("hidden");
    resultTitle.textContent = extractPhonetic(dictData);
    definition.innerHTML = extractDefinitions(dictData);
  }
}

function extractDefinitions(dictData) {
  var meaningsHtml = "<ul>";
  if (dictData.meanings.length > 0) {
    for (let i = 0; i < dictData.meanings.length; i++) {
      var meaning = dictData.meanings[i];
      meaningsHtml = meaningsHtml + "<li>[<i>" + meaning.partOfSpeech + "</i>]: " + meaning.definitions[0].definition;
      if (meaning.definitions[0].example !== undefined) {
        meaningsHtml = meaningsHtml + "<br/>e.g. " + meaning.definitions[0].example;
      }
      meaningsHtml = meaningsHtml + "</li>";
    }
  }
  return meaningsHtml + "</ul>";
}

function extractPhonetic(dictData) {
  if (dictData.phonetic !== undefined) {
    return dictData.word + " " + dictData.phonetic;
  } else if (dictData.phonetics.length > 0) {
    for (let i = 0; i < dictData.phonetics.length; i++) {
      if (dictData.phonetics[i].text !== undefined) {
        return dictData.word + " " + dictData.phonetics[i].text;
      }
    }
  }
  return "";
}