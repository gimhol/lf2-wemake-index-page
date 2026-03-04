import cns from "classnames";
import * as monaco from 'monaco-editor';
import { useContext, useEffect, useRef, useState } from "react";
import { context, EditorsContext } from "./base";
import csses from "./EditorGroupView.module.scss";
import { EditorTab } from "./EditorTab";
import { create_editor, type IEditor } from "./monaco";

export function EditorGroupView() {
  const ref_container = useRef<HTMLDivElement>(null);
  const { state: { tabs, tab: actived, project } } = useContext(EditorsContext)
  const [editor, set_editor] = useState<IEditor | null>(null)
  const tab = tabs.find(v => v.id === actived)
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
      // stupid
      setTimeout(() => editor.dispose(), 1000)
      set_editor(null)
    }
  }, [])

  useEffect(() => {
    if (!project || !tab || !editor) return;
    context.load_editor_state(project, tab, editor);
    return () => {
      context.save_editor_state(project, tab, editor);
    }
  }, [editor, tab, project])

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
