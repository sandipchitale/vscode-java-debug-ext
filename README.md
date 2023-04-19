# vscode-java-debug-ext README

This extends the Debugger for Java VSCode extension.

## Features

Adds the following command(s):

|Command Name|Command ID|Description|
|-|-|-|
|```Show Type```|```vscode-java-debug-ext.showType```|Show the Open Type quick pick for type of the variable node. If the type of variable is inner type it may first prompt for each of the parent types and the innermost type.|
|```Show Type of Container```|```vscode-java-debug-ext.showTypeOfContainer```|Show the Open Type quick pick for type of the parent of variable node. If the type of container of variable is inner type it may first prompt for each of the parent types and the innermost type.|

This basically addresses [Provide "Open type" button in variables' menu](https://github.com/microsoft/vscode-java-debug/issues/1104)

![Show Type Command](images/variable-show-type.png)
![Open Type Quick Pick](images/variable-open-type.png)

---
COMING SOON: Java Debugger outline view. This tries to address [vscode-java-debug issue 1298](https://github.com/microsoft/vscode-java-debug/issues/1298)

![Java Debugger Outline View](images/java-debugger-outline-view.png)

This will allow setting:

- Class load breakpoint [ClassPrepareRequest](https://docs.oracle.com/en/java/javase/17/docs/api/jdk.jdi/com/sun/jdi/request/ClassPrepareRequest.html)
- Constructor and Method breakpoint
  - Overloaded constructors and methods (Not possible because of the limitations of VSCode Java Debug support even though it is supported by the Java Debugger API)
  - All overloaded Constructors and methods Entry [MethodEntryRequest](https://docs.oracle.com/en/java/javase/17/docs/api/jdk.jdi/com/sun/jdi/request/MethodEntryRequest.html)
  - Constructors and methods Exit [MethodExitRequest](https://docs.oracle.com/en/java/javase/17/docs/api/jdk.jdi/com/sun/jdi/request/MethodExitRequest.html)
- Field watchpoint
  - Access watchpoint [AccessWatchpointRequest](https://docs.oracle.com/en/java/javase/17/docs/api/jdk.jdi/com/sun/jdi/request/AccessWatchpointRequest.html)
  - Modification watchpoint [ModificationWatchpointRequest](https://docs.oracle.com/en/java/javase/17/docs/api/jdk.jdi/com/sun/jdi/request/ModificationWatchpointRequest.html)
---

UPDATE: For innert types shows all outer types as well.

UPDATE: Use fully qualified name for types.

## Known Issues

This works well when ```toString()``` for Object types is disabled in Variables view.

## Requirements

Requires extention  [Debugger for Java](https://marketplace.visualstudio.com/items?itemName=vscjava.vscode-java-debug) (```vscjava.vscode-java-debug```)

## Extension Settings

None.

