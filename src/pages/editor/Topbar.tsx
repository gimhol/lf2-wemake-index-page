import { open_file } from "@/components/pickfile/open_file";
import Toast from "@/gimd/Toast";
import { interrupt_event } from "@/utils/interrupt_event";
import { useCallback, useContext } from "react";
import { context, EditorsContext, type IEditorTab, type IEditorTreeNode } from "./base";
import csses from "./Topbar.module.scss";

export function Topbar() {
  const { state, set_state, } = useContext(EditorsContext);
  const { tabs, clicks, trees, project } = state;

  const import_file = useCallback(async () => {
    if (!project) return;
    const files = await open_file(true, '.dat,.txt')
    if (!files.length) return;
    const valids = await context.import_files(project, files)
    if (!valids.length) return;
    const last = valids[valids.length - 1];
    const next_tabs: IEditorTab[] = [...tabs, ...valids]
    const next_clicks: string[] = [...clicks, ...valids.map(v => v.id)]
    const next_trees: IEditorTreeNode[] = [...trees, ...valids.map(v => {
      const ret: IEditorTreeNode = {
        ...v,
        depth: 0,
        children: []
      }
      return ret;
    })]
    set_state(draft => {
      draft.tabs = next_tabs;
      draft.tab = last.id;
      draft.clicks = next_clicks;
      draft.trees = next_trees
    })
  }, [set_state, trees, clicks, tabs, project])

  const new_project = async () => {
    const { id } = await context.new_project();
    const projects = await context.projects();
    set_state(draft => {
      draft.projects = projects;
      draft.project = id;
    })
  }

  return (
    <div className={csses.editor_head}>
      <button onClick={(e) => { interrupt_event(e); new_project().catch(Toast.error) }}>
        new project
      </button>
      {project ?
        <button onClick={(e) => { interrupt_event(e); import_file().catch(Toast.error) }}>
          import
        </button> : null}
    </div>
  )
}