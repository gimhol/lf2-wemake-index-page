import { interrupt_event } from "@/utils/interrupt_event";
import cns from "classnames";
import { useContext } from "react";
import { type IEditorTab, EditorsContext } from "./base";
import csses from "./EditorTab.module.scss";
export interface IEditorTabProps {
  info: IEditorTab
}
export function EditorTab(props: IEditorTabProps) {
  const { info } = props;
  const { state, open, close } = useContext(EditorsContext);
  const is_actived = info.id == state.actived
  const cls = cns(csses.editor_tab, is_actived ? csses.actived : void 0)
  return (
    <div
      className={cls}
      title={`name: ${info.name} type: ${info.type}`}
      onClick={e => {
        interrupt_event(e);
        open(info);
      }}>
      {info.name}
      <div
        className={csses.btn_close_tab}
        onClick={e => {
          interrupt_event(e);
          close(info);
        }}
      >
        ✖︎
      </div>
    </div>
  )
}