import Toast from "@/gimd/Toast";
import { interrupt_event } from "@/utils/interrupt_event";
import { useContext } from "react";
import { context, EditorsContext } from "./base";
import csses from "./Topbar.module.scss";

export function Topbar() {
  const { state, set_state, set_pending } = useContext(EditorsContext);
  const { project } = state;

  return (
    <div className={csses.editor_head}>
      <button onClick={(e) => {
        interrupt_event(e);
        set_pending(true)
        context.new_project()
          .then(set_state)
          .catch(Toast.error)
          .finally(() => set_pending(false))
      }}>
        new project
      </button>
      {project ?
        <button onClick={(e) => {
          interrupt_event(e);
          set_pending(true)
          context.import_files(project)
            .then(set_state)
            .catch(Toast.error)
            .finally(() => set_pending(false))
        }}>
          import
        </button> : null}
    </div>
  )
}