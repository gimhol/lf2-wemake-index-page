import img_angle_right from "@/assets/svg/angle-right.svg";
import Toast from "@/gimd/Toast";
import { interrupt_event } from "@/utils/interrupt_event";
import { useContext, useRef, useState } from "react";
import { type IEditorTreeNode, context, EditorsContext } from "./base";
import csses from "./TreeItem.module.scss";
export function TreeItem(props: { info: IEditorTreeNode; }) {
  const { info } = props;
  const { state: { project }, set_state, set_pending } = useContext(EditorsContext);
  const ref_root = useRef<HTMLDivElement>(null);
  const [renaming, set_renaming] = useState(false)
  if (!project) return <></>
  return (
    <div
      ref={ref_root}
      className={csses.tree_item}
      tabIndex={-1}
      onClick={e => {
        interrupt_event(e);
        if (info.children.length) return;
        set_pending(true)
        context.open_file(project, info)
          .then(set_state)
          .catch(Toast.error)
          .finally(() => set_pending(false))

        ref_root.current?.focus();
      }}>
      <div className={csses.left} style={{ paddingLeft: (info.depth + 1) * 8 }}>
        <div className={csses.icon_wrapper}>
          <img className={csses.icon} src={img_angle_right} alt="" />
        </div>
      </div>
      {renaming ?
        <input
          className={csses.name_input}
          defaultValue={info.name}
          onClick={e => e.stopPropagation()}
          autoFocus
          onFocus={e => {
            const el = e.target as HTMLInputElement;
            const idx = el.value.lastIndexOf('.')
            if (idx <= 0) el.setSelectionRange(0, el.value.length)
            else el.setSelectionRange(0, idx)
          }}
          onBlur={e => {
            console.log(`blur`, e)
            set_renaming(false)
          }} /> :
        <div
          className={csses.name}
          children={info.name}
          onClick={(e) => {
            e.stopPropagation()
            set_renaming(true)
          }} />
      }
    </div >
  );
}

