"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deactivate = exports.activate = void 0;
const vscode_1 = require("vscode");
const HelloWorldPanel_1 = require("./panels/HelloWorldPanel");
const DictionaryViewProvider_1 = require("./providers/DictionaryViewProvider");
function activate(context) {
    // register commands
    let helloPanelDisposable = vscode_1.commands.registerCommand('vscode-dict.helloWorld', () => {
        HelloWorldPanel_1.HelloWorldPanel.render(context.extensionUri);
    });
    context.subscriptions.push(helloPanelDisposable);
    // register views
    const dictProvider = new DictionaryViewProvider_1.DictionaryViewProvider(context.extensionUri);
    let dictViewDisposable = vscode_1.window.registerWebviewViewProvider(DictionaryViewProvider_1.DictionaryViewProvider.viewType, dictProvider);
    context.subscriptions.push(dictViewDisposable);
}
exports.activate = activate;
function deactivate() { }
exports.deactivate = deactivate;
//# sourceMappingURL=extension.js.map