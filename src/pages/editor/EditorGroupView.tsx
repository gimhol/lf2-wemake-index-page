import cns from "classnames";
import * as monaco from 'monaco-editor';
import { useContext, useEffect, useRef, useState } from "react";
import { context, EditorsContext, type IEditorState } from "./base";
import csses from "./EditorGroupView.module.scss";
import { EditorTab } from "./EditorTab";
import { create_editor, type IEditor } from "./monaco";

export function EditorGroupView() {
  const ref_container = useRef<HTMLDivElement>(null);
  const { state: { tabs, tab: actived, project } } = useContext(EditorsContext)
  const [editor, set_editor] = useState<IEditor | null>(null)

  useEffect(() => {
    const editor = create_editor(ref_container.current!, {
      value: '',
      language: 'lf2-dat',
      theme: 'lf2-dat',
      automaticLayout: true,
    });
    editor.onMouseDown((e: monaco.editor.IEditorMouseEvent) => {
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
    set_editor(editor)
    return () => {
      editor.dispose()
      set_editor(null)
    }
  }, [])

  useEffect(() => {
    if (!project) return;
    const tab = tabs.find(v => v.id === actived);
    if (!tab || !editor) return;
    const forage = context.forage(project);
    let destructed = false;
    forage
      .getItem<IEditorState>('editor_state_' + tab.id)
      .then(state => {
        if (destructed) return;
        if (!editor) return;
        editor.focus();
        if (!state) {
          editor.setSelections([]);
          editor.setValue('');
          return;
        }
        editor.setValue(state.content || '');
        const next_selection = state.selections?.map(s => new monaco.Selection(
          s.startLineNumber,
          s.startColumn,
          s.endLineNumber,
          s.endColumn
        )) ?? [];
        if (!next_selection.length) next_selection.push(new monaco.Selection(0, 0, 0, 0));
        editor.setPosition(state.position || new monaco.Position(0, 0));
        editor.setSelections(next_selection);
        editor.setScrollLeft(state.scrollLeft ?? 0);
        editor.setScrollTop(state.scrollTop ?? 0);
      }).catch(e => {
        console.warn(e)
      })

    return () => {
      destructed = true;
      const prev_state: IEditorState = {
        selections: editor.getSelections()?.map(s => {
          const d = s.getDirection();
          return {
            startLineNumber: d ? s.endLineNumber : s.startLineNumber,
            startColumn: d ? s.endColumn : s.startColumn,
            endLineNumber: d ? s.startLineNumber : s.endLineNumber,
            endColumn: d ? s.startColumn : s.endColumn,
          };
        }),
        position: editor.getPosition()?.clone(),
        scrollLeft: editor.getScrollLeft(),
        scrollTop: editor.getScrollTop(),
        content: editor.getValue(),
      };
      forage.setItem<IEditorState>('editor_state_' + tab.id, prev_state);
    }
  }, [editor, actived, tabs, project])



  return (
    <div className={cns(csses.editor_view)}>
      <div className={csses.editor_tabs_row}>
        {tabs.map((v) => <EditorTab key={v.id} info={v} />)}
        <div className={csses.empty_space} />
      </div>
      <div
        ref={ref_container}
        className={csses.editor_text_area_container}
        contentEditable />
    </div>
  )
}
