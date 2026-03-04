
import type * as monaco from 'monaco-editor';
import { createContext } from 'react';
import type { Updater } from 'use-immer';
import { WEditorsContext, type IProjectInfo } from './WEditorsContext';

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
  tab: string;
  clicks: string[];
  project: string | undefined;
  projects: IProjectInfo[];
}

export const init_editor_state: IEditorsState = {
  trees: [],
  tabs: [],
  tab: '',
  clicks: [],
  project: void 0,
  projects: []
}

export interface IEditorsContextValue {
  state: IEditorsState;
  set_state: Updater<IEditorsState>;
}
export const init_editors_context_value: IEditorsContextValue = {
  state: init_editor_state,
  set_state: () => console.warn('not ready'),
}
export const context = new WEditorsContext();
export const EditorsContext = createContext<IEditorsContextValue>(init_editors_context_value)

