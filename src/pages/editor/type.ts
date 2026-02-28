
import type * as monaco from 'monaco-editor';
export interface IEditorTab {
  id: string;
  name: string;
  type: string;
}
export interface IEditorState {
  content?: null | string;
  selections?: null | monaco.IRange[],
  position?: null | monaco.IPosition,
  scrollLeft?: number,
  scrollTop?: number,
}
export interface IEditorsState {
  tabs: IEditorTab[];
  actived: string;
  clicks: string[];
}

export const init_editor_state: IEditorsState = { tabs: [], actived: '', clicks: [] }