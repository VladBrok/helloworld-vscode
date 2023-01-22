import { nanoid } from "nanoid";
import * as vscode from "vscode";
import { NodeDependenciesProvider } from "./tree-view";

export function activate(context: vscode.ExtensionContext) {
  const p = new NodeDependenciesProvider(context);

  ////////////////////////
  const name =
    vscode.workspace.getConfiguration().get<string>("helloworld.targetName") ??
    "";

  const disposable00 = vscode.commands.registerCommand(
    "helloworld.saveSelectedCodeFragment",
    () => {
      const showNoTextMsg = () =>
        vscode.window.showInformationMessage(
          "Select a piece of code in the editor to save it as a fragment."
        );

      const editor = vscode.window.activeTextEditor;
      if (!editor) {
        showNoTextMsg();
        return;
      }

      editor.edit(() => {
        const content = editor.document.getText(editor.selection);

        if (content.length < 1) {
          showNoTextMsg();
          return;
        }

        const config = vscode.workspace.getConfiguration("helloworld");

        const defaultLabel = content.substring(0, 100);

        // TODO: add config option
        // if (config.get("askForNameOnCreate")) {
        if (true) {
          const opt: vscode.InputBoxOptions = {
            ignoreFocusOut: false,
            placeHolder: "Code Fragment Name",
            prompt: "Give the fragment a name...",
            value: defaultLabel,
          };

          vscode.window.showInputBox(opt).then((label) => {
            p.saveNewCodeFragment(content, label);
          });
        } else {
          // fragmentManager.saveNewCodeFragment(content, defaultLabel);
        }
      });
    }
  );

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
    disposable00,
    disposable0,
    disposable1,
    disposable2,
    disposable3
  );
}

export function deactivate() {}
