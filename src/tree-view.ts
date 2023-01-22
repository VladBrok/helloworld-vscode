import { nanoid } from "nanoid";
import * as vscode from "vscode";

interface TreeElement {
  item: Dependency;
  parentId?: string;
  children?: Dependency[];
}

export class NodeDependenciesProvider
  implements
    vscode.TreeDataProvider<Dependency>,
    vscode.TreeDragAndDropController<Dependency>
{
  dropMimeTypes = ["application/vnd.code.tree.nodeDependencies"];
  dragMimeTypes = ["text/uri-list"];

  private elements = new Map<string, TreeElement>();
  private rootId: string = "";

  private _onDidChangeTreeData: vscode.EventEmitter<
    Dependency | undefined | null | void
  > = new vscode.EventEmitter<Dependency | undefined | null | void>();

  readonly onDidChangeTreeData: vscode.Event<
    Dependency | undefined | null | void
  > = this._onDidChangeTreeData.event;

  constructor(context: vscode.ExtensionContext) {
    const view = vscode.window.createTreeView("nodeDependencies", {
      treeDataProvider: this,
      showCollapseAll: true,
      canSelectMany: false,
      dragAndDropController: this,
    });
    context.subscriptions.push(view);

    const root = new Dependency(
      "label",
      this.getVersion(),
      vscode.TreeItemCollapsibleState.Expanded
    );
    const child = new Dependency(
      "label",
      this.getVersion(),
      vscode.TreeItemCollapsibleState.Expanded
    );
    const child2 = new Dependency(
      "label",
      this.getVersion(),
      vscode.TreeItemCollapsibleState.Expanded
    );
    const child3 = new Dependency(
      "label",
      this.getVersion(),
      vscode.TreeItemCollapsibleState.Expanded
    );
    const leaf = new Dependency(
      "label",
      this.getVersion(),
      vscode.TreeItemCollapsibleState.None
    );
    const leaf2 = new Dependency(
      "label",
      this.getVersion(),
      vscode.TreeItemCollapsibleState.None
    );

    this.rootId = root.id!;

    this.elements.set(this.rootId, {
      item: root,
      children: [child, child2, child3],
    });
    this.elements.set(child2.id!, {
      item: child2,
      parentId: this.rootId,
      children: [],
    });
    this.elements.set(child3.id!, {
      item: child3,
      parentId: this.rootId,
      children: [],
    });
    this.elements.set(child.id!, {
      item: child,
      parentId: root.id,
      children: [leaf, leaf2],
    });
    this.elements.set(leaf.id!, { item: leaf, parentId: child.id });
    this.elements.set(leaf2.id!, { item: leaf2, parentId: child.id });
  }

  refresh(): void {
    this._onDidChangeTreeData.fire();
  }

  getTreeItem(
    element: Dependency
  ): vscode.TreeItem | Thenable<vscode.TreeItem> {
    return element;
  }

  getChildren(
    element?: Dependency | undefined
  ): vscode.ProviderResult<Dependency[]> {
    if (!element) {
      return this.elements.get(this.rootId)?.children ?? [];
    }

    return this.elements.get(element?.id ?? "")?.children ?? [];
  }

  handleDrag(
    source: readonly Dependency[],
    dataTransfer: vscode.DataTransfer,
    token: vscode.CancellationToken
  ): void | Thenable<void> {
    if (token.isCancellationRequested) {
      return;
    }

    if (source.length > 1) {
      throw new Error("Expected canSelectMany to be false");
    }

    dataTransfer.set(
      "application/vnd.code.tree.nodeDependencies",
      new vscode.DataTransferItem(source[0])
    );
  }

  handleDrop(
    target: Dependency | undefined,
    dataTransfer: vscode.DataTransfer,
    token: vscode.CancellationToken
  ): void | Thenable<void> {
    if (token.isCancellationRequested) {
      return;
    }

    const transferItem = dataTransfer.get(
      "application/vnd.code.tree.nodeDependencies"
    );
    if (!transferItem) {
      return;
    }

    const droppedItem = transferItem.value as Dependency;
    if (target?.id === droppedItem.id) {
      return;
    }

    const element = this.elements.get(droppedItem.id!);
    if (element == null) {
      throw new Error(`Expected to find an element with id ${droppedItem.id}`);
    }

    const targetIsRoot = target == null;
    const newParentId = targetIsRoot
      ? this.rootId
      : target.collapsibleState === vscode.TreeItemCollapsibleState.None
      ? this.elements.get(target.id!)?.parentId
      : target.id;

    let tempId = newParentId;
    while (tempId) {
      const curElement = this.elements.get(tempId);
      if (
        curElement?.item.id === droppedItem.id ||
        curElement?.parentId === droppedItem.id
      ) {
        return;
      }
      tempId = curElement?.parentId;
    }

    const previousParent = this.elements.get(element.parentId!);
    previousParent?.children?.splice(
      previousParent.children.findIndex((x) => x.id === droppedItem.id),
      1
    );

    element.parentId = newParentId;
    const newParentElement = this.elements.get(newParentId!);
    newParentElement?.children?.push(droppedItem);

    this.refresh();
  }

  private getVersion(): string {
    return Math.random().toString();
  }
}

export class Dependency extends vscode.TreeItem {
  constructor(
    public readonly label: string,
    private version: string,
    public readonly collapsibleState: vscode.TreeItemCollapsibleState
  ) {
    super(label, collapsibleState);
    this.description = this.version;
    this.id = nanoid();
  }
}
