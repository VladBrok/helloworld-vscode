import { nanoid } from "nanoid";
import * as vscode from "vscode";
import { NodeDependenciesProvider } from "./tree-view";

const randomBetween = (minInclusive: number, maxInclusive: number) => {
  return (
    Math.floor(Math.random() * (maxInclusive - minInclusive + 1)) + minInclusive
  );
};

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
