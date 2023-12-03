import { 
    CancellationToken, 
    Event, 
    EventEmitter, 
    ProviderResult, 
    TreeDataProvider, 
    TreeItem,
    TreeItemCollapsibleState,
    Uri,
    window
} from "vscode";
import * as path from 'path';

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

    private _onDidChangeTreeData: EventEmitter<Word | undefined | null | void> = new EventEmitter<Word | undefined | null | void>();

    readonly onDidChangeTreeData?: Event<void | Word | Word[] | null | undefined> | undefined = this._onDidChangeTreeData.event;

    refresh(): void {
        this._onDidChangeTreeData.fire();
        window.showInformationMessage("refreshed");
    }

    add(word: string): void {
        this.historyWords.push(new Word(word, TreeItemCollapsibleState.None));
        this._onDidChangeTreeData.fire();
    }

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

    constructor(public readonly label: string, 
        public readonly collapsibleState: TreeItemCollapsibleState) {
        super(label, collapsibleState);
        this.tooltip = `${this.label}`;
    }

    iconPath = {
        light: path.join(__filename, '..', '..', 'resources', 'dependency-light.svg'),
        dark: path.join(__filename, '..', '..', 'resources', 'dependency-dark.svg')
    };

    contextValue = 'word';
}
