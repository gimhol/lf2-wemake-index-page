import cns from "classnames";
import { useEffect, useMemo, useState } from "react";
import { useImmer } from "use-immer";
import { context, EditorsContext, init_editors_context_value, type IEditorsContextValue, type IEditorsState } from "./base";
import { EditorGroupView } from "./EditorGroupView";
import csses from "./index.module.scss";
import { ProjectFiles } from "./ProjectFiles";
import { Topbar } from "./Topbar";


export default function Editor() {
  const [ready, set_ready] = useState(false);
  const [state, set_state] = useImmer<IEditorsState>(init_editors_context_value.state);
  const { tabs, project } = state;
  const forage = project ? context.forage(project) : void 0

  const context_value = useMemo<IEditorsContextValue>(() => {
    const ret: IEditorsContextValue = { state, set_state }
    return ret
  }, [state, set_state])

  useEffect(() => {
    if (ready) return;
    let _destructed = false;
    const job = async () => {
      const state = await context.open_project()
      if (_destructed) return;
      if (!state) {
        set_ready(true)
        return;
      }
      set_state(state)
      set_ready(true)
    }
    job();
    return () => { _destructed = true }
  }, [set_state, ready, forage])

  useEffect(() => {
    if (!ready || !forage) return;
    forage.setItem<IEditorsState>(`editors_state`, state)
  }, [state, ready, forage])


  return (
    <EditorsContext.Provider value={context_value}>
      <div className={cns(csses.editor_root, 'monaco-editor')}>
        <Topbar />
        <div className={csses.editor_main}>
          <div className={cns(csses.second_view)}>
            {state.projects?.map((v) => <ProjectFiles key={v.id} info={v} />)}
          </div>
          {
            (state.project && tabs.length) ?
              <EditorGroupView />
              : null
          }
        </div>
      </div>
    </EditorsContext.Provider>
  )
}



