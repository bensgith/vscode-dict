"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DictionaryViewProvider = void 0;
const vscode_1 = require("vscode");
const getUri_1 = require("../utilities/getUri");
const getNonce_1 = require("../utilities/getNonce");
const axios_1 = require("axios");
class DictionaryViewProvider {
    constructor(_extensionUri) {
        this._extensionUri = _extensionUri;
        // empty
    }
    resolveWebviewView(webviewView, context, token) {
        // Allow scripts in the webview
        webviewView.webview.options = {
            // Enable JavaScript in the webview
            enableScripts: true,
            // Restrict the webview to only load resources from the `out` directory
            localResourceRoots: [vscode_1.Uri.joinPath(this._extensionUri, "out")],
        };
        // Set the HTML content that will fill the webview view
        webviewView.webview.html = this._getWebviewContent(webviewView.webview, this._extensionUri);
        // Sets up an event listener to listen for messages passed from the webview view context
        // and executes code based on the message that is recieved
        this._setWebviewMessageListener(webviewView);
    }
    _getWebviewContent(webview, _extensionUri) {
        const webviewUri = (0, getUri_1.getUri)(webview, _extensionUri, ["out", "webview.js"]);
        const stylesUri = (0, getUri_1.getUri)(webview, _extensionUri, ["out", "styles.css"]);
        const nonce = (0, getNonce_1.getNonce)();
        return /*html*/ `
            <!DOCTYPE html>
            <html lang="en">
                <head>
                    <meta charset="UTF-8">
                    <meta name="viewport" content="width=device-width, initial-scale=1.0">
                    <meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src ${webview.cspSource}; script-src 'nonce-${nonce}';">
                    <link rel="stylesheet" href="${stylesUri}">
                    <title>Weather Checker</title>
                </head>
                <body>
                    <h1>Search</h1>
                    <section id="search-container">
                        <vscode-text-field id="word" placeholder="Input your word"></vscode-text-field>
                    </section>
                    <vscode-button id="search-button">Search</vscode-button>
                    <h2 id="word-tittle"></h2>
                    <section id="results-container">
                        <vscode-progress-ring id="loading" class="hidden"></vscode-progress-ring>
                        <p id="explanation"></p>
                    </section>
                    <script type="module" nonce="${nonce}" src="${webviewUri}"></script>
                </body>
            </html>
		`;
    }
    _setWebviewMessageListener(webviewView) {
        webviewView.webview.onDidReceiveMessage((message) => {
            const command = message.command;
            const word = message.word;
            switch (command) {
                case "search":
                    axios_1.default.get("https://api.dictionaryapi.dev/api/v2/entries/en/" + word)
                        .then(function (response) {
                        webviewView.webview.postMessage({
                            command: "search",
                            payload: JSON.stringify(response.data[0]),
                        });
                    })
                        .catch(function (error) {
                        webviewView.webview.postMessage({
                            command: "error",
                            message: "Sorry couldn't get explanation at this time...",
                        });
                        return;
                    });
                    break;
            }
        });
    }
}
exports.DictionaryViewProvider = DictionaryViewProvider;
DictionaryViewProvider.viewType = "dictionary.view";
//# sourceMappingURL=DictionaryViewProvider.js.map