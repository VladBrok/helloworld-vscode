import { nanoid } from "nanoid";
import * as vscode from "vscode";
import { NodeDependenciesProvider } from "./tree-view";

export function activate(context: vscode.ExtensionContext) {
  const p = new NodeDependenciesProvider(context);

  ////////////////////////
  const name =
    vscode.workspace.getConfiguration().get<string>("helloworld.targetName") ??
    "";

  const disposable0 = vscode.commands.registerCommand(
    "helloworld.insertCodeFragment",
    (id: string) => {
      if (!id) {
        vscode.window.showInformationMessage(
          "Insert a code fragment into the editor by clicking on it in the Code Fragments view."
        );
      }

      const editor = vscode.window.activeTextEditor;
      if (!editor) {
        vscode.window.showInformationMessage(
          "Open a file in the editor to insert a fragment."
        );
        return;
      }

      const content = p.getFragmentContent(id);

      if (content) {
        editor.edit((builder) => {
          builder.insert(editor.selection.start, content);
        });
      }
    }
  );

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

  context.subscriptions.push(
    disposable0,
    disposable1,
    disposable2,
    disposable3
  );
}

export function deactivate() {}
