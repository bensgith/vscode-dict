import { 
    CancellationToken, 
    Event, 
    ProviderResult, 
    TreeDataProvider, 
    TreeItem,
    TreeItemCollapsibleState,
    Uri
} from "vscode";

export class HistoryTreeViewProvider implements TreeDataProvider<Word> {
    public static readonly viewType = "dictionary.history";
    public historyWords: Word[] = [
        new Word('apple', TreeItemCollapsibleState.None),
        new Word('banana', TreeItemCollapsibleState.None),
        new Word('cherry', TreeItemCollapsibleState.None)
    ];

    constructor(private readonly _extensionUri: Uri) {
        // empty
    }

    onDidChangeTreeData?: Event<void | Word | Word[] | null | undefined> | undefined;

    // Implement this to return the UI representation (TreeItem) of the element that gets displayed in the view.
    getTreeItem(element: Word): TreeItem | Thenable<TreeItem> {
        return element;
    }

    // Implement this to return the children for the given element or root (if no element is passed).
    // When the user opens the Tree View, the getChildren method will be called without an element.
    // From there, your TreeDataProvider should return your top-level tree items.
    getChildren(element?: Word | undefined): ProviderResult<Word[]> {
        return this.historyWords;
    }

    getParent?(element: Word): ProviderResult<Word> {
        throw new Error("Method not implemented.");
    }

    resolveTreeItem?(item: TreeItem, element: Word, token: CancellationToken): ProviderResult<TreeItem> {
        throw new Error("Method not implemented.");
    }
}

export class Word extends TreeItem {

    constructor(
        public readonly label: string,
        public readonly collapsibleState: TreeItemCollapsibleState
      ) {
        super(label, collapsibleState);
        this.tooltip = `${this.label}`;
      }
}
