import * as vscode from 'vscode';


let debuggerOutlineViewDataProvider: DebuggerOutlineViewDataProvider;
let timeoutId: NodeJS.Timeout | undefined = undefined;

export function activate(context: vscode.ExtensionContext) {
    context.subscriptions.push(
        vscode.commands.registerCommand(
            'vscode-java-debug-ext.showDocumentSymbols',
            showDocumentSymbols
        )
    );
    context.subscriptions.push(
        vscode.commands.registerCommand(
            'vscode-java-debug-ext.showType',
            showType
        )
    );
    context.subscriptions.push(
        vscode.commands.registerCommand(
            'vscode-java-debug-ext.showTypeOfContainer',
            showTypeOfContainer
        )
    );

    debuggerOutlineViewDataProvider = new DebuggerOutlineViewDataProvider();
    vscode.window.registerTreeDataProvider('java-debugger-outline', debuggerOutlineViewDataProvider);

    vscode.window.onDidChangeActiveTextEditor((activeTextEditor) => {
        // Cancel previous timeout
        if (timeoutId) {
            clearTimeout(timeoutId);
            timeoutId = undefined;
        }
        if (activeTextEditor && activeTextEditor.document.languageId === 'java') {
            vscode.commands.executeCommand<vscode.DocumentSymbol[]>('vscode.executeDocumentSymbolProvider', activeTextEditor.document.uri).then((documentSymbols) => {
                debuggerOutlineViewDataProvider.documentSymbols = documentSymbols;
            });
        } else {
            debuggerOutlineViewDataProvider.documentSymbols = [];
        }
    });

    context.subscriptions.push(
        vscode.commands.registerCommand(
            'vscode-java-debug-ext.java-debugger-outline-refresh',
            showDocumentSymbols
        )
    );

    context.subscriptions.push(
        vscode.commands.registerCommand(
            'vscode-java-debug-ext.toggle-classload-breakpoint',
            () => {
                vscode.window.showInformationMessage('Class load breakpoint not implemented yet!');
            }
        )
    );

    context.subscriptions.push(
        vscode.commands.registerCommand(
            'vscode-java-debug-ext.toggle-method-breakpoint',
            () => {
                vscode.window.showInformationMessage('Method breakpoint not implemented yet!');
            }
        )
    );

    context.subscriptions.push(
        vscode.commands.registerCommand(
            'vscode-java-debug-ext.toggle-field-watchpoint',
            () => {
                vscode.window.showInformationMessage('Field watchpoint not implemented yet!');
            }
        )
    );

    // Debounce document symbol updates
    vscode.workspace.onDidChangeTextDocument((event) => {
        // Cancel previous timeout
        if (timeoutId) {
            clearTimeout(timeoutId);
            timeoutId = undefined;
        }
        if (event.document.languageId !== 'java') {
            // Not a Java file - noting to do
            return;
        }
        timeoutId = setTimeout(() => {
            timeoutId = undefined;
            showDocumentSymbols();
        }, 5000);
    });

    showDocumentSymbols();
}

async function showDocumentSymbols() {
    const activeTextEditor = vscode.window.activeTextEditor;
    if (activeTextEditor) {
        const document = activeTextEditor.document;
        if (document && document.languageId === 'java') {
            const documentSymbols = await vscode.commands.executeCommand<
                vscode.DocumentSymbol[]
            >('vscode.executeDocumentSymbolProvider', document.uri);
            if (documentSymbols) {
                debuggerOutlineViewDataProvider.documentSymbols = documentSymbols;
            }
        }
    }
}

function dumpSymbols(
    symbolInformation: vscode.DocumentSymbol[],
    indent: string = ''
) {
    symbolInformation.forEach((symbol: vscode.DocumentSymbol) => {
        console.log(`${indent}${symbol.name}: ${symbol.kind}`);
        if (symbol.children) {
            dumpSymbols(symbol.children, indent + '  ');
        }
    });
}

async function showType(variableNode: any) {
    _showType(variableNode.variable.value);
}

async function showTypeOfContainer(variableNode: any) {
    _showType(variableNode.container.value);
}

async function _showType(value: any) {
    // const variableName = variableNode.variable.name;
    let variableType = value;

    // Remove object id
    if (/@[x0-9a-fA-F]*$/.test(variableType)) {
        variableType = variableType.replace(/@.*$/, '');
    }

    //Remove array suffix
    if (/\[[x0-9a-fA-F]*\]$/.test(variableType)) {
        variableType = variableType.replace(/\[.*$/, '');
    }

    const variableTypeParts = variableType.split('$');

    if (variableTypeParts && variableTypeParts.length > 0) {
        if (variableTypeParts.length > 1) {
            // Clear array
            variableTypeParts.length = 0;
            variableTypeParts.push(variableType.replace(/\$/g, '.'));
            let lastIndexOf$ = variableType.lastIndexOf('$');
            while (lastIndexOf$ !== -1) {
                // Replace $ with .
                variableTypeParts.push(
                    variableType.substring(0, lastIndexOf$).replace(/\$/g, '.')
                );
                lastIndexOf$ = variableType.lastIndexOf('$', lastIndexOf$ - 1);
            }

            variableType = await vscode.window.showQuickPick(variableTypeParts);
        } else {
            variableType = variableTypeParts[0];
        }

        if (variableType) {
            // Convert to Simple Type name - why?
            // variableType = variableType.replace(/^.*\./, '');

            await vscode.env.clipboard.writeText(variableType);

            await vscode.commands.executeCommand(
                'workbench.action.quickOpen',
                '#' + variableType
            );
        }
    }
}

export function deactivate() {}

export class DebuggerOutlineViewDataProvider implements vscode.TreeDataProvider<vscode.DocumentSymbol>
{
    private _onDidChangeTreeData: vscode.EventEmitter<vscode.DocumentSymbol | undefined> = new vscode.EventEmitter<vscode.DocumentSymbol | undefined>();
    readonly onDidChangeTreeData: vscode.Event<vscode.DocumentSymbol | undefined> = this._onDidChangeTreeData.event;

    _documentSymbols: vscode.DocumentSymbol[] = [];

    constructor() {
    }

    getTreeItem(element: vscode.DocumentSymbol): vscode.TreeItem {
        const treeItem = new vscode.TreeItem(
            element.name,
            element.children.length > 0
                ? vscode.TreeItemCollapsibleState.Expanded
                : vscode.TreeItemCollapsibleState.None
        );
        treeItem.tooltip = `${element.name}`;
        treeItem.description = element.detail;

        switch (element.kind) {
            case vscode.SymbolKind.Package:
                treeItem.iconPath = new vscode.ThemeIcon(`symbol-package`);
                treeItem.contextValue = `java-debugger-outline-package`;
                break;
            case vscode.SymbolKind.Class:
                treeItem.iconPath = new vscode.ThemeIcon(`symbol-class`);
                treeItem.contextValue = `java-debugger-outline-class`;
                break;
            case vscode.SymbolKind.Constant:
                treeItem.iconPath = new vscode.ThemeIcon(`symbol-constant`);
                treeItem.contextValue = `java-debugger-outline-constant`;
                break;
            case vscode.SymbolKind.Interface:
                treeItem.iconPath = new vscode.ThemeIcon(`symbol-interface`);
                treeItem.contextValue = `java-debugger-outline-interface`;
                break;
            case vscode.SymbolKind.Enum:
                treeItem.iconPath = new vscode.ThemeIcon(`symbol-enum`);
                treeItem.contextValue = `java-debugger-outline-enum`;
                break;
            case vscode.SymbolKind.EnumMember:
                treeItem.iconPath = new vscode.ThemeIcon(`symbol-enum-member`);
                treeItem.contextValue = `java-debugger-outline-enum-member`;
                break;
            case vscode.SymbolKind.Constructor:
                treeItem.iconPath = new vscode.ThemeIcon(`symbol-constructor`);
                treeItem.contextValue = `java-debugger-outline-constructor`;
                break;
            case vscode.SymbolKind.Method:
                treeItem.iconPath = new vscode.ThemeIcon(`symbol-method`);
                treeItem.contextValue = `java-debugger-outline-method`;
                break;
            case vscode.SymbolKind.Field:
                treeItem.iconPath = new vscode.ThemeIcon(`symbol-field`);
                treeItem.contextValue = `java-debugger-outline-field`;
                break;
            case vscode.SymbolKind.Property:
                treeItem.iconPath = new vscode.ThemeIcon(`symbol-property`);
                treeItem.contextValue = `java-debugger-outline-property`;
                break;
            case vscode.SymbolKind.Variable:
                treeItem.iconPath = new vscode.ThemeIcon(`symbol-variable`);
                treeItem.contextValue = `java-debugger-outline-variable`;
                break;
        }
        return treeItem;
    }

    getChildren(element?: vscode.DocumentSymbol): vscode.ProviderResult<vscode.DocumentSymbol[]> {
        if (element) {
            return element.children;
        } else {
            return this._documentSymbols;
        }
    }

    get documentSymbols() {
        return this._documentSymbols;
    }

    set documentSymbols(documentSymbols: vscode.DocumentSymbol[]) {
        this._documentSymbols = documentSymbols;
        this.refresh();
    }

    refresh(): void {
        this._onDidChangeTreeData.fire(undefined);
    }
}
