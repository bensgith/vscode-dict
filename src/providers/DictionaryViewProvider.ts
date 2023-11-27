import { 
    CancellationToken, 
    Uri, 
    Webview, 
    WebviewView, 
    WebviewViewProvider, 
    WebviewViewResolveContext 
} from "vscode";
import { getUri } from "../utilities/getUri";
import { getNonce } from "../utilities/getNonce";
import axios from "axios";

export class DictionaryViewProvider implements WebviewViewProvider {
    public static readonly viewType = "dictionary.view";

    constructor(private readonly _extensionUri: Uri) {
        // empty
    }

    public resolveWebviewView(
        webviewView: WebviewView, 
        context: WebviewViewResolveContext, 
        token: CancellationToken) {

            // Allow scripts in the webview
            webviewView.webview.options = {
                // Enable JavaScript in the webview
                enableScripts: true,
                // Restrict the webview to only load resources from the `out` directory
                localResourceRoots: [Uri.joinPath(this._extensionUri, "out")],
            };

            // Set the HTML content that will fill the webview view
            webviewView.webview.html = this._getWebviewContent(webviewView.webview, this._extensionUri);

            // Sets up an event listener to listen for messages passed from the webview view context
            // and executes code based on the message that is recieved
            this._setWebviewMessageListener(webviewView);

    }

    private _getWebviewContent(webview: Webview, _extensionUri: Uri): string {
        const webviewUri = getUri(webview, _extensionUri, ["out", "webview.js"]);
        const stylesUri = getUri(webview, _extensionUri, ["out", "styles.css"]);
        const nonce = getNonce();

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
                        <vscode-button id="search-button">Search</vscode-button>
                    </section>
                    <h2 id="result-tittle"></h2>
                    <section id="result-container">
                        <vscode-progress-ring id="loading" class="hidden"></vscode-progress-ring>
                        <p id="explanation"></p>
                    </section>
                    <script type="module" nonce="${nonce}" src="${webviewUri}"></script>
                </body>
            </html>
		`;
    }
    
    private _setWebviewMessageListener(webviewView: WebviewView) {
        webviewView.webview.onDidReceiveMessage((message) => {
          const command = message.command;
          const word = message.word;
    
          switch (command) {
            case "search":
                axios.get("https://api.dictionaryapi.dev/api/v2/entries/en/" + word)
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