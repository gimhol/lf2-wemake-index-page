import { interrupt_event } from "@/utils/interrupt_event";
import { useContext } from "react";
import { type IEditorTreeNode, EditorsContext } from "./base";
import csses from "./TreeItem.module.scss";
import img_angle_right from "@/assets/svg/angle-right.svg"
export function TreeItem(props: { v: IEditorTreeNode; }) {
  const { v } = props;
  const { open } = useContext(EditorsContext);
  return (
    <div
      className={csses.tree_item}
      onClick={e => {
        interrupt_event(e);
        if (v.children.length) return;
        open(v);
      }}
      style={{ paddingLeft: (v.depth + 1) * 8 }}>
      <img src={img_angle_right} alt="" />
      {v.name}
    </div>
  );
}
