import { nanoid } from "nanoid";
import * as vscode from "vscode";
import { NodeDependenciesProvider } from "./tree-view";

const randomBetween = (minInclusive: number, maxInclusive: number) => {
  return (
    Math.floor(Math.random() * (maxInclusive - minInclusive + 1)) + minInclusive
  );
};

/*
  "contributes": {
    "menus": {
      "editor/context": [
        {
          "command": "helloworld.saveToCodeToolbox",
          "when": "editorTextFocus"
        }
      ]
    },
    "views": {
      "explorer": [
        {
          "id": "nodeDependencies",
          "name": "Node dependencies"
        }
      ]
    },
    "commands": [
      {
        "command": "showState",
        "title": "Show state"
      },
      {
        "command": "updateState",
        "title": "Update state"
      },
      {
        "command": "helloworld.insertCodeFragment",
        "title": "Insert Code fragment"
      },
      {
        "command": "helloworld.saveSelectedCodeFragment",
        "title": "Save Selected Code fragment"
      },
      {
        "command": "helloworld.helloVlad",
        "title": "Hello Vlad"
      },
      {
        "command": "helloworld.showCurTime",
        "title": "Show Current Time"
      },
      {
        "command": "helloworld.generateId",
        "title": "Generate unique id"
      }
    ],
    "configuration": {
      "title": "HelloWorld",
      "properties": {
        "helloworld.targetName": {
          "type": "string",
          "default": "Vlad",
          "markdownDescription": "Specifies the _hello target_"
        }
      }
    }
  },
*/

export function activate(context: vscode.ExtensionContext) {
  const key = "my_synced_key";
  context.globalState.setKeysForSync([key]);

  const entries: [string, number][] = Array(randomBetween(3, 20))
    .fill(0)
    .map((_, i) => [`random_value_${i}:`, Math.random()]);
  const data = Object.fromEntries(entries);

  context.globalState.update(key, data).then(() => {
    vscode.window.showInformationMessage(
      `state: ${JSON.stringify(context.globalState.get(key), null, 2)}`
    );
  });

  vscode.commands.registerCommand("showState", () => {
    vscode.window.showInformationMessage(
      `state: ${JSON.stringify(context.globalState.get(key), null, 2)}`
    );
  });

  vscode.commands.registerCommand("updateState", () => {
    const entries: [string, number][] = Array(randomBetween(3, 20))
      .fill(0)
      .map((_, i) => [`random_value_${i}:`, Math.random()]);
    const data = Object.fromEntries(entries);

    context.globalState.update(key, data).then(() => {
      vscode.window.showInformationMessage(
        `state: ${JSON.stringify(context.globalState.get(key), null, 2)}`
      );
    });
  });
}
