# vscode-java-debug-ext README

This extends the Debugger for Java VSCode extension.

## Features

Adds the following command(s):

|Command Name|Command ID|Description|
|-|-|-|
|```Show Type```|```vscode-java-debug-ext.showType```|Show the Open Type quick pick for type of the variable node. If the type of variable is inner type it may first prompt for each of the parent types and the innermost type. |

This basically addresses [Provide "Open type" button in variables' menu](https://github.com/microsoft/vscode-java-debug/issues/1104)

![Show Type Command](images/variable-show-type.png)
![Open Type Quick Pick](images/variable-open-type.png)

## Known Issues

This works well when ```toString()``` for Object types is disabled in Variables view.

## Requirements

Requires extention  [Debugger for Java](https://marketplace.visualstudio.com/items?itemName=vscjava.vscode-java-debug) (```vscjava.vscode-java-debug```)

## Extension Settings

None.

