import * as vscode from 'vscode';

export function activate(context: vscode.ExtensionContext) {
    context.subscriptions.push(vscode.commands.registerCommand('vscode-java-debug-ext.showType', showType));
    context.subscriptions.push(vscode.commands.registerCommand('vscode-java-debug-ext.showTypeOfContainer', showTypeOfContainer));
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
            // Clear array
            variableTypeParts.length = 0;
            variableTypeParts.push(variableType.replace(/\$/g, '.'));
            let lastIndexOf$ = variableType.lastIndexOf('$');
            while (lastIndexOf$ !== -1) {
                // Replace $ with .
                variableTypeParts.push(variableType.substring(0, lastIndexOf$).replace(/\$/g, '.'));
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

            await vscode.commands.executeCommand("workbench.action.quickOpen", "#" + variableType);
        }
    }
}

export function deactivate() {}
