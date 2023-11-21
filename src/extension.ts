import * as vscode from 'vscode';
import { HelloWorldPanel } from './panels/HelloWorldPanel';


export function activate(context: vscode.ExtensionContext) {

	// Use the console to output diagnostic information (console.log) and errors (console.error)
	// This line of code will only be executed once when your extension is activated
	console.log('Congratulations, your extension "vscode-dict" is now active!');

	// The command has been defined in the package.json file
	let disposable = vscode.commands.registerCommand('vscode-dict.helloWorld', () => {
		HelloWorldPanel.render(context.extensionUri);
		vscode.window.showInformationMessage('Hello World from vscode-dict!');
	});

	context.subscriptions.push(disposable);
}

export function deactivate() {}
