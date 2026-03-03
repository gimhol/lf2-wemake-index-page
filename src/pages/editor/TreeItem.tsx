import img_angle_right from "@/assets/svg/angle-right.svg";
import { interrupt_event } from "@/utils/interrupt_event";
import { useContext, useRef } from "react";
import { type IEditorTreeNode, EditorsContext } from "./base";
import csses from "./TreeItem.module.scss";
export function TreeItem(props: { info: IEditorTreeNode; }) {
  const { info } = props;
  const { open } = useContext(EditorsContext);
  const ref_root = useRef<HTMLDivElement>(null);
  return (
    <div
      ref={ref_root}
      className={csses.tree_item}
      tabIndex={-1}
      onClick={e => {
        interrupt_event(e);
        if (info.children.length) return;
        open(info);
        ref_root.current?.focus();
      }}>
      <div className={csses.left} style={{ paddingLeft: (info.depth + 1) * 8 }}>
        <div className={csses.icon_wrapper}>
          <img className={csses.icon} src={img_angle_right} alt="" />
        </div>
      </div>
      {info.name}
    </div>
  );
}

