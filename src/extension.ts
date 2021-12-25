import * as vscode from 'vscode';

export function activate(context: vscode.ExtensionContext) {
    let disposable = vscode.commands.registerCommand('vscode-java-debug-ext.showType', showType);
    context.subscriptions.push(disposable);
}

async function showType(variableNode: any) {
    // const variableName = variableNode.variable.name;
    let variableType = variableNode.variable.value;

    // Remove object id
    if ((/@[x0-9a-fA-F]*$/).test(variableType)) {
        variableType = variableType.replace(/@.*$/, '');
    }

    //Remove array suffix
    if ((/\[[x0-9a-fA-F]*\]$/).test(variableType)) {
        variableType = variableType.replace(/\[.*$/, '');
    }

    const variableTypeParts = variableType.split('$');

    if (variableTypeParts && variableTypeParts.length > 0) {

        if (variableTypeParts.length > 1) {
            variableType = await vscode.window.showQuickPick(variableTypeParts);
        } else {
            variableType = variableTypeParts[0];
        }

        if (variableType) {
            // Convert to Simple Type name
            variableType = variableType.replace(/^.*\./, '');

            await vscode.env.clipboard.writeText(variableType);

            await vscode.commands.executeCommand("workbench.action.quickOpen", "#" + variableType);
        }
    }
}

export function deactivate() {}
