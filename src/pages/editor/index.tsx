import { open_file } from "@/components/pickfile/open_file";
import { interrupt_event } from "@/utils/interrupt_event";
import cns from "classnames";
import * as monaco from 'monaco-editor';
import { useEffect, useRef, useState } from "react";
import { useImmer } from "use-immer";
import { encode_lf2_dat, save_to_file } from "./decode_lf2_dat";
import csses from "./index.module.scss";
import { forage } from "./init";
import { read_dat_or_txt } from "./read_dat_or_txt";
import { init_editor_state, type IEditorsState, type IEditorState, type IEditorTab } from "./type";

export default function Editor() {
  const ref_editor = useRef<monaco.editor.IStandaloneCodeEditor | null>(null)
  const ref_container = useRef<HTMLDivElement>(null);
  const [file_name, set_file_name] = useState('')
  const [state, set_state] = useImmer<IEditorsState>(init_editor_state)
  const [ready, set_ready] = useState(false);
  const load_editor_state = async (tab: IEditorTab) => {
    const editor = ref_editor.current;
    if (!editor) return;
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
  }
  const save_editor_state = async () => {
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
    forage.setItem<IEditorState>('editor_state_' + state.actived, prev_state)
  }
  const del_editor_state = async (tab: IEditorTab) => {
    await forage.removeItem('editor_state_' + tab.id)
  }
  useEffect(() => {
    if (ready) return;
    forage.getItem<IEditorsState>(`editors_state`).then(r => {
      const tab = r?.tabs.find(v => v.id == r.actived)
      if (tab) load_editor_state(tab)
      set_state(r ?? init_editor_state)
      set_ready(true)
    })
  }, [set_state, ready])

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

  const import_file = async () => {
    const editor = ref_editor.current;
    if (!editor) return;
    const files = await open_file(true, '.dat,.txt')
    if (!files.length) return;
    for (const file of files) {
      const uuid = crypto.randomUUID();
      const text = await read_dat_or_txt(file);
      const prev_state: IEditorState = { content: text }
      forage.setItem<IEditorState>('editor_state_' + uuid, prev_state)
      set_state(d => {
        const idx = d.tabs.findIndex(v => v.id === uuid);
        if (idx >= 0) {
          d.actived = d.tabs[idx].id;
          return;
        }
        d.tabs.push({
          id: uuid,
          name: file.name,
          type: file.type,
        })
        d.actived = uuid;
      })
      set_file_name(file.name)
      editor.setValue(text);
    }

  }
  const save_file = async () => {
    const editor = ref_editor.current;
    if (!editor) return;
    const value = editor.getValue()
    const buf = await encode_lf2_dat(value)
    save_to_file(buf, file_name)
  }
  const use_tab = async (tab: IEditorTab) => {
    if (tab.id === state.actived) return;
    const editor = ref_editor.current;
    if (!editor) return;
    await save_editor_state()
    const clicks = [...state.clicks, tab.id]
    set_state(draft => {
      draft.actived = tab.id;
      draft.clicks = clicks
    })
    await load_editor_state(tab)
  }
  const close_tab = async (tab: IEditorTab) => {
    await del_editor_state(tab)
    const idx = state.tabs.findIndex(v => v.id == tab.id);
    const clicks = state.clicks.filter(v => v != tab.id)
    const tabs = state.tabs.filter(v => v.id != tab.id)
    const next = tabs.find(v => v.id == clicks[clicks.length - 1]) ?? tabs[idx] ?? tabs[idx - 1]
    set_state(draft => {
      draft.tabs = tabs
      draft.clicks = clicks
      draft.actived = next?.id ?? ''
    })
    if (next) await load_editor_state(next)
  }
  return (
    <div className={cns(csses.editor_view, 'monaco-editor')}>
      <div className={csses.editor_head}>
        <button onClick={(e) => { interrupt_event(e); import_file() }}>
          import
        </button>
        <button onClick={(e) => { interrupt_event(e); save_file() }}>
          save
        </button>
      </div>
      <div className={csses.editor_tabs_row}>
        {state.tabs?.map((v) => {
          const is_actived = v.id == state.actived
          const cls = cns(csses.editor_tab, is_actived ? csses.actived : void 0)
          return (
            <div
              key={v.id}
              className={cls}
              title={`name: ${v.name} type: ${v.type}`}
              onClick={e => {
                interrupt_event(e);
                use_tab(v);
              }}>
              {v.name}
              <div
                className={csses.btn_close_tab}
                onClick={e => {
                  interrupt_event(e);
                  close_tab(v);
                }}
              >
                ✖︎
              </div>
            </div>
          )
        })}
        <div className={csses.empty_space} />
      </div>
      <div
        ref={ref_container}
        className={csses.editor_text_area_container}
        contentEditable />
    </div>
  )
}