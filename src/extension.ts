import { ExtensionContext, commands, window } from "vscode";
import { HelloWorldPanel } from "./panels/HelloWorldPanel";
import { DictionaryViewProvider } from "./providers/DictionaryViewProvider";


export function activate(context: ExtensionContext) {
	// register commands
	let helloPanelDisposable = commands.registerCommand('vscode-dict.helloWorld', () => {
		HelloWorldPanel.render(context.extensionUri);
	});
	context.subscriptions.push(helloPanelDisposable);
	
	// register views
	const dictProvider = new DictionaryViewProvider(context.extensionUri);
	let dictViewDisposable = window.registerWebviewViewProvider(
		DictionaryViewProvider.viewType,
		dictProvider
	);
	context.subscriptions.push(dictViewDisposable);
}

export function deactivate() {}
