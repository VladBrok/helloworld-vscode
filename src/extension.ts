import { nanoid } from "nanoid";
import * as vscode from "vscode";
import { NodeDependenciesProvider } from "./tree-view";

export function activate(context: vscode.ExtensionContext) {
  new NodeDependenciesProvider(context);

  ////////////////////////
  const name =
    vscode.workspace.getConfiguration().get<string>("helloworld.targetName") ??
    "";

  const disposable1 = vscode.commands.registerCommand(
    "helloworld.helloVlad",
    () => {
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
