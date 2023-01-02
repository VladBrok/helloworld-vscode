import { nanoid } from "nanoid";
import * as vscode from "vscode";

export function activate(context: vscode.ExtensionContext) {
  console.log('Congratulations, your extension "helloworld" is now active!');

  const name =
    vscode.workspace.getConfiguration().get<string>("helloworld.targetName") ??
    "";
  vscode.window.showInformationMessage(name);

  // The command has been defined in the package.json file
  // Now provide the implementation of the command with registerCommand
  // The commandId parameter must match the command field in package.json
  let disposable1 = vscode.commands.registerCommand(
    "helloworld.helloVlad",
    () => {
      // The code you place here will be executed every time your command is executed
      // Display a message box to the user
      vscode.window.showWarningMessage(`Hello, ${name}!`);
    }
  );
  const disposable2 = vscode.commands.registerCommand(
    "helloworld.showCurTime",
    () => {
      vscode.window.showInformationMessage(
        `Current time is: ${new Date().toLocaleTimeString()}`
      );
    }
  );

  const disposable3 = vscode.commands.registerCommand(
    "helloworld.generateId",
    () => {
      vscode.window.showInformationMessage(`Unique id: ${nanoid()}`);
    }
  );

  context.subscriptions.push(disposable1, disposable2, disposable3);
}

export function deactivate() {}
