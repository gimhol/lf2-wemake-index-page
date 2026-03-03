import { open_file } from "@/components/pickfile/open_file";
import { interrupt_event } from "@/utils/interrupt_event";
import cns from "classnames";
import * as monaco from 'monaco-editor';
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useImmer } from "use-immer";
import { EditorsContext, init_editor_state, type IEditorsContextValue, type IEditorsState, type IEditorState, type IEditorTab, type IEditorTreeNode } from "./base";
import { encode_lf2_dat } from "./decode_lf2_dat";
import { EditorTab } from "./EditorTab";
import csses from "./index.module.scss";
import { forage } from "./init";
import { read_dat_or_txt } from "./read_dat_or_txt";
import { TreeItem } from "./TreeItem";

export default function Editor() {
  const ref_editor = useRef<monaco.editor.IStandaloneCodeEditor | null>(null)
  const ref_container = useRef<HTMLDivElement>(null);
  const [state, set_state] = useImmer<IEditorsState>(init_editor_state)

  const { tabs, clicks, trees, actived } = state;
  const [ready, set_ready] = useState(false);
  const load_editor_state = useCallback(async (tab?: IEditorTab | null) => {
    const editor = ref_editor.current;
    if (!editor) return;
    if (!tab) {
      editor.setValue('');
      return
    }
    const state = await forage.getItem<IEditorState>('editor_state_' + tab.id)
    const text = state?.content ?? "";
    editor.setValue(text);
    if (state) {
      const next_selection = state.selections?.map(s => new monaco.Selection(
        s.startLineNumber,
        s.startColumn,
        s.endLineNumber,
        s.endColumn,
      )) ?? [];
      if (!next_selection.length) next_selection.push(new monaco.Selection(0, 0, 0, 0))
      editor.setPosition(state.position || new monaco.Position(0, 0))
      editor.setSelections(next_selection)
      editor.setScrollLeft(state.scrollLeft ?? 0)
      editor.setScrollTop(state.scrollTop ?? 0)
    }
    editor.focus()
  }, [])
  const del_editor_state = useCallback(async (tab: IEditorTab) => {
    await forage.removeItem('editor_state_' + tab.id)
  }, [])
  const save_editor_state = useCallback(async (tab: IEditorTab) => {
    const editor = ref_editor.current;
    if (!editor) return;
    const prev_state: IEditorState = {
      selections: editor.getSelections()?.map(s => {
        const d = s.getDirection()
        return {
          startLineNumber: d ? s.endLineNumber : s.startLineNumber,
          startColumn: d ? s.endColumn : s.startColumn,
          endLineNumber: d ? s.startLineNumber : s.endLineNumber,
          endColumn: d ? s.startColumn : s.endColumn,
        }
      }),
      position: editor.getPosition()?.clone(),
      scrollLeft: editor.getScrollLeft(),
      scrollTop: editor.getScrollTop(),
      content: editor.getValue(),
    }
    forage.setItem<IEditorState>('editor_state_' + tab.id, prev_state)
  }, [])

  useEffect(() => {
    if (ready) return;
    forage.getItem<IEditorsState>(`editors_state`).then(r => {
      const tab = r?.tabs.find(v => v.id == r.actived)
      if (tab) load_editor_state(tab)
      set_state(r ?? init_editor_state)
      set_ready(true)
    })
  }, [set_state, ready, load_editor_state])

  useEffect(() => {
    if (!ready) return;
    forage.setItem<IEditorsState>(`editors_state`, state)
  }, [state, ready])

  useEffect(() => {
    ref_editor.current?.onMouseDown((e: monaco.editor.IEditorMouseEvent) => {
      const editor = ref_editor.current;
      if (!editor) return;
      if (e.event.buttons != 1 || !e.event.ctrlKey) return;
      const txt = e.target.element?.innerText;
      if (!txt) return;
      const model = editor.getModel();
      if (!model) return;
      const [, a] = txt.match(/next:\s*(\d+)/) || []
      const [, b] = txt.match(/hit_[a-zA-Z]*:\s*(\d+)/) || []
      const next = Number(a ?? b);
      if (!Number.isInteger(next) || !next) return;
      const [result] = model.findMatches(`<frame>\\s*${next}[\n\\s][\\s\\S\n]*?<frame_end>`, true, true, true, null, true)
      if (!result) return;
      const { lineNumber: lnum0 } = result.range.getStartPosition()
      const { lineNumber: lnum1 } = result.range.getEndPosition()
      editor.revealLines(lnum0, lnum1, 0)
      editor.setSelection(result.range)
    })
  })
  useEffect(() => {
    const editor = ref_editor.current = monaco.editor.create(ref_container.current!, {
      value: '',
      language: 'lf2-dat',
      theme: 'lf2-dat',
      automaticLayout: true,
    });
    return () => {
      editor.dispose()
      ref_editor.current = null
    }
  }, [])

  const import_file = useCallback(async () => {
    const editor = ref_editor.current;
    if (!editor) return;
    const files = await open_file(true, '.dat,.txt')
    if (!files.length) return;
    const valids: IEditorTab[] = [];
    let text = ''
    for (const file of files) {
      const uuid = crypto.randomUUID();
      text = await read_dat_or_txt(file);
      const prev_state: IEditorState = { content: text }
      forage.setItem<IEditorState>('editor_state_' + uuid, prev_state)
      valids.push({
        id: uuid,
        type: file.type,
        name: file.name
      })
    }
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
      draft.actived = last.id;
      draft.clicks = next_clicks;
      draft.trees = next_trees
    })
    editor.setValue(text);
  }, [set_state, trees, clicks, tabs])

  const export_file = async () => {
    const editor = ref_editor.current;
    if (!editor) return;
    const value = editor.getValue()
    const buf = await encode_lf2_dat(value)
    // save_to_file(buf, file_name)
    console.log(buf)
  }

  const open = useCallback(async (tab: IEditorTab) => {
    if (tab.id === actived) return;
    const editor = ref_editor.current;
    if (!editor) return;
    const prev = tabs.find(v => v.id == actived);
    if (prev) await save_editor_state(prev)
    let next_tabs: IEditorTab[] | null = null;
    const exist = tabs.find(v => v.id === tab.id)
    if (!exist) next_tabs = [...tabs, tab]
    const next_clicks = [...clicks, tab.id]
    set_state(draft => {
      draft.actived = tab.id;
      draft.clicks = next_clicks;
      if (next_tabs) draft.tabs = next_tabs
    })
    await load_editor_state(tab)
  }, [tabs, actived, clicks, set_state, save_editor_state, load_editor_state])

  const close = useCallback(async (tab: IEditorTab) => {
    const idx = tabs.findIndex(v => v.id == tab.id);
    const next_clicks = clicks.filter(v => v != tab.id)
    const next_tabs = tabs.filter(v => v.id != tab.id)
    const last = next_clicks[next_clicks.length - 1]
    const next_actived = next_tabs.find(v => v.id == last) ?? next_tabs[idx] ?? next_tabs[idx - 1];
    set_state(draft => {
      draft.tabs = next_tabs
      draft.clicks = next_clicks
      draft.actived = next_actived?.id ?? ''
    })
    await load_editor_state(next_actived)
  }, [tabs, clicks, set_state, load_editor_state])

  const del = useCallback(async (tab: IEditorTab) => {
    await del_editor_state(tab)
    await close(tab)
  }, [del_editor_state, close])

  const ctx_value = useMemo<IEditorsContextValue>(() => {
    const ret: IEditorsContextValue = { state, open, del, close }
    return ret
  }, [state, open, del, close])

  return (
    <EditorsContext.Provider value={ctx_value}>
      <div className={cns(csses.editor_root, 'monaco-editor')}>
        <div className={cns(csses.files)}>
          {state.trees?.map((v) => <TreeItem key={v.id} v={v} />)}
        </div>
        <div className={cns(csses.editor_view)}>
          <div className={csses.editor_head}>
            <button onClick={(e) => { interrupt_event(e); import_file() }}>
              import
            </button>
            <button onClick={(e) => { interrupt_event(e); export_file() }}>
              export
            </button>
          </div>
          <div className={csses.editor_tabs_row}>
            {state.tabs?.map((v) => <EditorTab key={v.id} info={v} />)}
            <div className={csses.empty_space} />
          </div>
          <div
            ref={ref_container}
            className={csses.editor_text_area_container}
            contentEditable />
        </div>
      </div>
    </EditorsContext.Provider>
  )
}


