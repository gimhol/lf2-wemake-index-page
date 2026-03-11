import img_angle_right from "@/assets/svg/angle-right.svg";
import Toast from "@/gimd/Toast";
import { useContext, useRef, useState } from "react";
import { type IEditorTreeNode, context, EditorsContext } from "./base";
import csses from "./TreeItem.module.scss";
import validateFilename from "./validateFilename";
export function TreeItem(props: { info: IEditorTreeNode; }) {
  const { info } = props;
  const { state: { project }, set_state, set_pending } = useContext(EditorsContext);
  const ref_root = useRef<HTMLDivElement>(null);
  const [renaming, set_renaming] = useState(false)
  if (!project) return <></>;

  const on_root_key_down = (e: React.KeyboardEvent) => {
    switch (e.key.toLowerCase()) {
      case 'f2':
        e.stopPropagation();
        e.preventDefault();
        set_renaming(true);
        break;
    }
  }
  const on_root_click = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    if (info.children.length) return;
    set_pending(true)
    context.open_file(project, info)
      .then(set_state)
      .catch(Toast.error)
      .finally(() => set_pending(false))
    ref_root.current?.focus();
  }
  const on_name_key_down = (e: React.KeyboardEvent) => {
    const el = e.target as HTMLInputElement;
    switch (e.key.toLowerCase()) {
      case 'escape':
      case 'enter':
        e.stopPropagation();
        e.preventDefault();
        el.blur()
        break;
      case 'f2':
        e.stopPropagation();
        e.preventDefault();
        switch_name_input_selection_range(el)
        break;
    }
  }
  const on_name_input_focus = (e: React.FocusEvent) => {
    const el = e.target.closest('input')
    if (!el) return;
    switch_name_input_selection_range(el)
  }
  const switch_name_input_selection_range = (el: HTMLInputElement) => {
    const i = el.value.lastIndexOf('.');
    const l = el.value.length
    const s = el.selectionStart
    const e = el.selectionEnd
    if (i <= 0 || s === 0 && e === i)
      el.setSelectionRange(0, l)
    else if (s === 0 && e === l)
      el.setSelectionRange(i + 1, l)
    else
      el.setSelectionRange(0, i)
  }
  const on_name_input_blur = (e: React.FocusEvent) => {
    const el = e.target.closest('input')
    if (!el) return;

    const new_name = el.value.trim();
    if (new_name == info.name) return set_renaming(false);

    if (!validateFilename(new_name).valid) {
      console.log('invalid name')
      return set_renaming(false);
    }
    // TODO: rename
    set_renaming(false);
  }
  return (
    <div
      ref={ref_root}
      className={csses.tree_item}
      tabIndex={-1}
      onKeyDown={on_root_key_down}
      onClick={on_root_click}>
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
          onKeyDown={on_name_key_down}
          autoFocus
          onFocus={on_name_input_focus}
          onBlur={on_name_input_blur} /> :
        <div
          className={csses.name}
          children={info.name} />
      }
    </div >
  );
}

