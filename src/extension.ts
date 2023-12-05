import { ExtensionContext, commands, window } from "vscode";
import { SearchViewProvider } from "./providers/SearchViewProvider";
import { HistoryTreeViewProvider } from "./providers/HistoryTreeViewProvider";


export function activate(context: ExtensionContext) {
	// register search view
	const searchViewProvider = new SearchViewProvider(context.extensionUri);
	let dictViewDisposable = window.registerWebviewViewProvider(
		SearchViewProvider.viewType,
		searchViewProvider,
		{
			webviewOptions: {
				// save webview state when invisible
				retainContextWhenHidden: true
			}
		}
	);
	context.subscriptions.push(dictViewDisposable);

	// register history tree view
	const historyTreeViewProvider = new HistoryTreeViewProvider(context.extensionUri);
	let hisTreeViewDisposable = window.registerTreeDataProvider(
		HistoryTreeViewProvider.viewType,
		historyTreeViewProvider
	);
	context.subscriptions.push(hisTreeViewDisposable);

	// register add history command
	commands.registerCommand("dictionary.addHistory", (word: string) => historyTreeViewProvider.addToHistory(word));
	commands.registerCommand("dictionary.clearHistory", () => historyTreeViewProvider.clearHistory());
}

export function deactivate() {}
