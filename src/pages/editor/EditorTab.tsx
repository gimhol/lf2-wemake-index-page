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
  const { state: { project, tab }, set_state, set_pending } = useContext(EditorsContext);
  const is_actived = info.id == tab
  const cls = cns(csses.editor_tab, is_actived ? csses.actived : void 0)
  if (!project) return <></>
  return (
    <div
      className={cls}
      title={`name: ${info.name} type: ${info.type}`}
      onClick={e => {
        interrupt_event(e);
        context.open_file(project, info)
          .then(set_state)
          .catch(Toast.error)
          .finally(() => set_pending(false))
      }}>
      {info.name}
      <div
        className={csses.btn_close_tab}
        onClick={e => {
          interrupt_event(e);
          context
            .close_file(project, info)
            .then(set_state)
            .catch(Toast.error)
            .finally(() => set_pending(false))
        }}
      >
        ✖︎
      </div>
    </div>
  )
}