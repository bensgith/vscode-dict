import { ExtensionContext, commands, window } from "vscode";
import { DictionaryViewProvider } from "./providers/DictionaryViewProvider";


export function activate(context: ExtensionContext) {
	// register views
	const dictProvider = new DictionaryViewProvider(context.extensionUri);
	let dictViewDisposable = window.registerWebviewViewProvider(
		DictionaryViewProvider.viewType,
		dictProvider,
		{
			webviewOptions: {
				// save webview state when invisible
				retainContextWhenHidden: true
			}
		}
	);
	context.subscriptions.push(dictViewDisposable);
}

export function deactivate() {}
