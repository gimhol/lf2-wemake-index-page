
import type * as monaco from 'monaco-editor';
import { createContext } from 'react';
import { WEditorsContext } from './WEditorsContext';

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
export interface IEditorTreeNode {
  id: string;
  name: string;
  type: string;
  depth: number;
  children: IEditorTreeNode[]
}

export interface IEditorsState {
  trees: IEditorTreeNode[];
  tabs: IEditorTab[];
  actived: string;
  clicks: string[];
}

export const init_editor_state: IEditorsState = {
  trees: [],
  tabs: [],
  actived: '',
  clicks: []
}
export interface IEditorsContextValue {
  state: IEditorsState;
  context: WEditorsContext;
  open(tab: IEditorTab): Promise<void>;
  close(tab: IEditorTab): Promise<void>;
  del(tab: IEditorTab): Promise<void>;
}
export const init_editors_context_value: IEditorsContextValue = {
  state: init_editor_state,
  context: new WEditorsContext(),
  open: () => Promise.reject('not ready'),
  del: () => Promise.reject('not ready'),
  close: () => Promise.reject('not ready')
}
export const EditorsContext = createContext<IEditorsContextValue>(init_editors_context_value)

