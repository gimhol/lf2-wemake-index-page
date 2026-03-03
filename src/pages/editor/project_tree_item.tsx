import type { IProjectInfo, IEditorTreeNode } from "./base";

export function project_tree_item(i: IProjectInfo): IEditorTreeNode {
  return {
    id: i.id,
    name: i.name,
    type: "",
    depth: 0,
    children: []
  };
}
