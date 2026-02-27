/* eslint-disable react-hooks/immutability */
import { open_file } from "@/components/pickfile/open_file";
import { interrupt_event } from "@/utils/interrupt_event";
import * as monaco from 'monaco-editor';
import { useCallback, useEffect, useRef, useState } from "react";
import { decode_lf2_dat, encode_lf2_dat, save_to_file } from "./decode_lf2_dat";
import csses from "./index.module.scss";

monaco.languages.register({ id: 'lf2-dat' })
monaco.editor.defineTheme('lf2-dat', {
  base: 'vs-dark',
  inherit: true,
  colors: {},
  rules: [{
    token: 'next',
    foreground: 'DCDCAA',
    fontStyle: 'text-decoration: underline',
    background: '#DCDCAA'
  }]
})
monaco.languages.setMonarchTokensProvider('lf2-dat', {
  tokenizer: {
    root: [
      [/sound:\s*\S+/, { token: 'next' }],
      [/next:\s*\d+/, { token: 'next' }],
      [/hit_[a-zA-Z]*:\s*\d+/, { token: 'next' }],
      [/layer:/, { token: 'type' }],
      [/layer_end/, { token: 'type' }],
      [/file\(\d+-\d+\):/, { token: 'keyword', }],
      [/walking_frame_rate/, { token: 'keyword' }],
      [/walking_speed/, { token: 'keyword' }],
      [/walking_speedz/, { token: 'keyword' }],
      [/running_frame_rate/, { token: 'keyword' }],
      [/running_speed/, { token: 'keyword' }],
      [/running_speedz/, { token: 'keyword' }],
      [/heavy_walking_speed/, { token: 'keyword' }],
      [/heavy_walking_speedz/, { token: 'keyword' }],
      [/heavy_running_speed/, { token: 'keyword' }],
      [/heavy_running_speedz/, { token: 'keyword' }],
      [/jump_height/, { token: 'keyword' }],
      [/jump_distance/, { token: 'keyword' }],
      [/jump_distancez/, { token: 'keyword' }],
      [/dash_height/, { token: 'keyword' }],
      [/dash_distance/, { token: 'keyword' }],
      [/dash_distancez/, { token: 'keyword' }],
      [/rowing_height/, { token: 'keyword' }],
      [/rowing_distance/, { token: 'keyword' }],
      [/<frame>/, { token: 'type' }],
      [/<.*?>/, { token: 'type' }],
      [/[a-zA-Z_]+:/, { token: "keyword" }],
    ],
  }
})

export default function Editor() {
  const ref_editor = useRef<monaco.editor.IStandaloneCodeEditor | null>(null)
  const ref_container = useRef<HTMLDivElement>(null);
  const [file_name, set_file_name] = useState('')

  const on_mouse_down = useCallback((e: monaco.editor.IEditorMouseEvent) => {
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
  }, [])

  useEffect(() => {
    ref_editor.current?.onMouseDown(on_mouse_down)
  }, [on_mouse_down])

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

  const _open_file = async () => {
    const editor = ref_editor.current;
    if (!editor) return;
    const [file] = await open_file(false, '.dat')
    if (!file) return;
    set_file_name(file.name)
    const text = await decode_lf2_dat(await file.arrayBuffer())
    editor.setValue(text);
  }

  const _save_file = async () => {
    const editor = ref_editor.current;
    if (!editor) return;
    const value = editor.getValue()
    const buf = await encode_lf2_dat(value)
    save_to_file(buf, file_name)
  }

  return (
    <div className={csses.editor_view}>
      <div className={csses.head}>
        <button onClick={(e) => { interrupt_event(e); _open_file() }}>
          open
        </button>
        <button onClick={(e) => { interrupt_event(e); _save_file() }}>
          save
        </button>
      </div>
      <div
        ref={ref_container}
        className={csses.text_area_container}
        contentEditable />
    </div>
  )
}