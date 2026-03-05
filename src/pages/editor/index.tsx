import Toast from "@/gimd/Toast";
import cns from "classnames";
import { useEffect, useMemo, useRef, useState } from "react";
import { useImmer } from "use-immer";
import { context, EditorsContext, init_editors_context_value, type IEditorsContextValue, type IEditorsState } from "./base";
import { EditorGroupView } from "./EditorGroupView";
import csses from "./index.module.scss";
import { ProjectFiles } from "./ProjectFiles";
import { SplitView } from "./SplitView";
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

  const ref_view_container = useRef<HTMLDivElement>(null)
  const ref_sash_container = useRef<HTMLDivElement>(null)
  useEffect(() => {
    const view_container = ref_view_container.current
    const sash_container = ref_sash_container.current
    const sv = new SplitView(view_container, sash_container, 'h');
    return () => {
      sv.set_view_container(view_container)
      sv.set_sash_container(sash_container)
      sv.release();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [SplitView])

  return (
    <EditorsContext.Provider value={context_value}>
      <div className={cns(csses.editor_root, 'monaco-editor')} >
        <Topbar />
        <div className={csses.editor_main}>
          <div className={csses.sash_container} ref={ref_sash_container} />
          <div className={csses.view_container} ref={ref_view_container}>
            <div className={cns(csses.second_view)}>
              {state.projects?.map((v) => <ProjectFiles key={v.id} info={v} />)}
            </div>
            <EditorGroupView />
            {/* <div /> */}
            {/* <div /> */}
          </div>
        </div>
      </div>
    </EditorsContext.Provider>
  )
}

