import { nanoid } from "nanoid";
import * as vscode from "vscode";

interface TreeElement {
  item: { id: string; label: string; description: string };
  parentId?: string;
  childIds?: string[];
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

  constructor(private readonly context: vscode.ExtensionContext) {
    const view = vscode.window.createTreeView("nodeDependencies", {
      treeDataProvider: this,
      showCollapseAll: true,
      canSelectMany: false,
      dragAndDropController: this,
    });
    this.context.subscriptions.push(view);

    // const root = {
    //   id: nanoid(),
    //   label: "label",
    //   description: this.getVersion(),
    // };
    // const child = {
    //   id: nanoid(),
    //   label: "label",
    //   description: this.getVersion(),
    // };
    // const child2 = {
    //   id: nanoid(),
    //   label: "label",
    //   description: this.getVersion(),
    // };
    // const child3 = {
    //   id: nanoid(),
    //   label: "label",
    //   description: this.getVersion(),
    // };
    // const leaf = {
    //   id: nanoid(),
    //   label: "label",
    //   description: this.getVersion(),
    // };
    // const leaf2 = {
    //   id: nanoid(),
    //   label: "label",
    //   description: this.getVersion(),
    // };

    // this.rootId = root.id!;

    // this.elements.set(this.rootId, {
    //   item: root,
    //   childIds: [child.id!, child2.id!, child3.id!],
    // });
    // this.elements.set(child2.id!, {
    //   item: child2,
    //   parentId: this.rootId,
    //   childIds: [],
    // });
    // this.elements.set(child3.id!, {
    //   item: child3,
    //   parentId: this.rootId,
    //   childIds: [],
    // });
    // this.elements.set(child.id!, {
    //   item: child,
    //   parentId: root.id,
    //   childIds: [leaf.id!, leaf2.id!],
    // });
    // this.elements.set(leaf.id!, { item: leaf, parentId: child.id });
    // this.elements.set(leaf2.id!, { item: leaf2, parentId: child.id });

    this.load();
  }

  serialize(): string {
    return JSON.stringify([...this.elements.values()]);
  }

  deserialize(json: string): void {
    this.elements.clear();
    const values = JSON.parse(json);
    values.forEach((x: any) => {
      this.elements.set(x.item.id, x);
      if (!x.parentId) {
        this.rootId = x.item.id;
      }
    });
  }

  public async saveNewCodeFragment(
    content: string,
    label?: string
  ): Promise<void> {
    const item = {
      id: nanoid(),
      label: label || "untitled",
      description: content,
    };
    this.elements.set(item.id, { item, parentId: this.rootId });
    this.elements.get(this.rootId)?.childIds?.push(item.id);

    this.save().then(() => this.refresh());
  }

  async save(): Promise<void> {
    // set undefined as value to remove
    await this.context.globalState.update(
      "some-key-definitely-unique",
      this.serialize()
    );
  }

  load() {
    this.deserialize(
      this.context.globalState.get("some-key-definitely-unique") || "[]"
    );
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
    const id = element ? element.id : this.rootId;

    vscode.window.showInformationMessage("showing children...");

    if (!id) {
      return [];
    }

    return (
      this.elements
        .get(id)
        ?.childIds?.map(
          (id) =>
            new Dependency(
              this.elements.get(id)?.item.label ?? "",
              this.elements.get(id)?.item.description ?? "",
              this.elements.get(id)?.childIds == null
                ? vscode.TreeItemCollapsibleState.None
                : vscode.TreeItemCollapsibleState.Expanded,
              id
            )
        ) ?? []
    );
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
    previousParent?.childIds?.splice(
      previousParent.childIds.findIndex((id) => id === droppedItem.id),
      1
    );

    element.parentId = newParentId;
    const newParentElement = this.elements.get(newParentId!);
    newParentElement?.childIds?.push(droppedItem.id!);

    this.save().then(() => this.refresh());
  }

  getFragmentContent(id: string): string {
    return this.elements.get(id)?.item.description?.toString() ?? "";
  }

  private getVersion(): string {
    return Math.random().toString();
  }
}

export class Dependency extends vscode.TreeItem {
  constructor(
    public readonly label: string,
    private version: string,
    public readonly collapsibleState: vscode.TreeItemCollapsibleState,
    id: string
  ) {
    super(label, collapsibleState);
    this.description = this.version;
    this.id = id;

    if (collapsibleState === vscode.TreeItemCollapsibleState.None) {
      this.command = {
        arguments: [this.id],
        command: "helloworld.insertCodeFragment",
        title: "Insert code",
        tooltip: "Insert code",
      };
    }
  }
}
