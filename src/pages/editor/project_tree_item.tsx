import type { IEditorTreeNode } from "./base";
import type { IProjectInfo } from "./WEditorsContext";

export function project_tree_item(i: IProjectInfo): IEditorTreeNode {
  return {
    id: i.id,
    name: i.name,
    type: "",
    depth: 0,
    children: []
  };
}
