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
  const howdyButton = document.getElementById("howdy") as Button;
  howdyButton?.addEventListener("click", handleHowdyClick);

  const searchButton = document.getElementById("search-button") as Button;
  searchButton.addEventListener("click", searchWord);
  const wordTextField = document.getElementById("word") as TextField;
  // TODO key down event not working?
  wordTextField.addEventListener("keydown", handleKeydown);

  setVSCodeMessageListener();
}

// Callback function that is executed when the howdy button is clicked
function handleHowdyClick() {
  // Some quick background:
  //
  // Webviews are sandboxed environments where abritrary HTML, CSS, and
  // JavaScript can be executed and rendered (i.e. it's basically an iframe).
  //
  // Because of this sandboxed nature, VS Code uses a mechanism of message
  // passing to get data from the extension context (i.e. src/panels/HelloWorldPanel.ts)
  // to the webview context (this file), all while maintaining security.
  //
  // vscode.postMessage() is the API that can be used to pass data from
  // the webview context back to the extension context––you can think of
  // this like sending data from the frontend to the backend of the extension.
  //
  // Note: If you instead want to send data from the extension context to the
  // webview context (i.e. backend to frontend), you can find documentation for
  // that here:
  //
  // https://code.visualstudio.com/api/extension-guides/webview#passing-messages-from-an-extension-to-a-webview
  //
  // The main thing to note is that postMessage() takes an object as a parameter.
  // This means arbitrary data (key-value pairs) can be added to the object
  // and then accessed when the message is recieved in the extension context.
  //
  // For example, the below object could also look like this:
  //
  // {
  //  command: "hello",
  //  text: "Hey there partner! �",
  //  random: ["arbitrary", "data"],
  // }
  //
  vscode.postMessage({
    command: "hello",
    text: "Hey there partner! �",
  });
}

function searchWord() {
  const word = document.getElementById("word") as TextField;
  vscode.postMessage({
    command: "search",
    word: word.value
  });

  displayLoadingState();
}

function handleKeydown(e: KeyboardEvent) {
  console.log("handling keydown");
  console.log(e.key);
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
  const explanation = document.getElementById("explanation");
  if (loading && explanation) {
    loading.classList.remove("hidden");
    explanation.textContent = "Searching word...";
  }
}

function displayError(errorMsg) {
  const loading = document.getElementById("loading") as ProgressRing;
  const explanation = document.getElementById("explanation");
  if (loading && explanation) {
    loading.classList.add("hidden");
   explanation.textContent = errorMsg;
  }
}

function displayDictionaryData(dictData) {
  const loading = document.getElementById("loading") as ProgressRing;
  const wordTittle = document.getElementById("word-tittle");
  const explanation = document.getElementById("explanation");
  if (loading && wordTittle && explanation) {
    loading.classList.add("hidden");
    wordTittle.textContent = dictData.word;
    explanation.textContent = dictData.meanings[0].definitions[0].definition;
  }
}