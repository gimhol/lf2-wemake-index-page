import Toast from "@/gimd/Toast";
import { interrupt_event } from "@/utils/interrupt_event";
import cns from "classnames";
import { useContext } from "react";
import { type IEditorTab, context, EditorsContext } from "./base";
import csses from "./EditorTab.module.scss";
export interface IEditorTabProps {
  info: IEditorTab
}
export function EditorTab(props: IEditorTabProps) {
  const { info } = props;
  const { state: { project, tab }, set_state } = useContext(EditorsContext);
  const is_actived = info.id == tab
  const cls = cns(csses.editor_tab, is_actived ? csses.actived : void 0)
  return (
    <div
      className={cls}
      title={`name: ${info.name} type: ${info.type}`}
      onClick={e => {
        interrupt_event(e);
        if (project) context.open_file(project, info).then(s => {
          set_state(s)
        }).catch(e => {
          Toast.error(e)
        })
      }}>
      {info.name}
      <div
        className={csses.btn_close_tab}
        onClick={e => {
          interrupt_event(e);
          if (project) context.close_file(project, info).then(s => {
            set_state(s)
          }).catch(e => {
            Toast.error(e)
          })
        }}
      >
        ✖︎
      </div>
    </div>
  )
}