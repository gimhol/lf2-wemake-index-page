import Toast from "@/gimd/Toast";
import cns from "classnames";
import { useEffect, useMemo, useState } from "react";
import { useImmer } from "use-immer";
import { context, EditorsContext, init_editors_context_value, type IEditorsContextValue, type IEditorsState } from "./base";
import { EditorGroupView } from "./EditorGroupView";
import csses from "./index.module.scss";
import { ProjectFiles } from "./ProjectFiles";
import { ReactSplitView } from "./ReactSplitView";
import { Topbar } from "./Topbar";


export default function Editor() {
  const [ready, set_ready] = useState(false);
  const [pending, set_pending] = useState(false);
  const [state, set_state] = useImmer<IEditorsState>(init_editors_context_value.state);
  const { project } = state;
  const forage = project ? context.forage(project) : void 0

  const context_value = useMemo<IEditorsContextValue>(() => {
    const ret: IEditorsContextValue = { state, set_state, pending, set_pending }
    return ret
  }, [state, set_state, pending, set_pending])

  useEffect(() => {
    if (ready) return;
    let _destructed = false;

    context.open_project().then(s => {
      if (_destructed) return;
      set_state(s)
      set_ready(true)
    }).catch(e => {
      Toast.error(e)
    }).finally(() => {
      set_pending(false)
    });
    return () => { _destructed = true }
  }, [set_state, ready, forage])

  useEffect(() => {
    if (!ready || !forage) return;
    forage.setItem<IEditorsState>(`editors_state`, state)
  }, [state, ready, forage])

  return (
    <EditorsContext.Provider value={context_value}>
      <ReactSplitView
        className={cns(csses.editor_root, 'monaco-editor')}
        direction="v">
        {(leaf) => {
          switch (leaf.data) {
            case 'root_top': return <Topbar />;
            case 'root_bottom': return <Topbar />;
            case 'second_view': {
              return (
                <div className={cns(csses.second_view)}>
                  {state.projects?.map((v) => <ProjectFiles key={v.id} info={v} />)}
                </div>)
            }
            case 'main_view': {
              return <EditorGroupView />;
            }
          }
        }}
      </ReactSplitView>
    </EditorsContext.Provider>
  )
}