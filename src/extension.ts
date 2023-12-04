import { ExtensionContext, commands, window } from "vscode";
import { DictionaryViewProvider } from "./providers/SearchViewProvider";
import { HistoryTreeViewProvider } from "./providers/HistoryTreeViewProvider";


export function activate(context: ExtensionContext) {
	// register search view
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

	// register history tree view
	const historyTreeProvider = new HistoryTreeViewProvider(context.extensionUri);
	let hisTreeViewDisposable = window.registerTreeDataProvider(
		HistoryTreeViewProvider.viewType,
		historyTreeProvider
	);
	context.subscriptions.push(hisTreeViewDisposable);

	// register add history command
	commands.registerCommand("dictionary.addHistory", (word: string) => historyTreeProvider.addToHistory(word));
	commands.registerCommand("dictionary.clearHistory", () => historyTreeProvider.clearHistory());
}

export function deactivate() {}
