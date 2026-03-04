import { open_file } from '@/components/pickfile/open_file';
import dayjs from 'dayjs';
import localforage from 'localforage';
import { init_editor_state, type IEditorsState, type IEditorState, type IEditorTab, type IEditorTreeNode } from './base';
import { monaco, type IEditor } from './monaco';
import { read_dat_or_txt } from './read_dat_or_txt';

const SK_PROJECTS = 'projects' as const;

export interface IProjectInfo {
  id: string,
  name: string;
  create_date: string;
  modified_date: string;
  open_date: string;
}
const TAG = '[WEditorsContext]'
export class WEditorsContext {
  readonly global_forage = localforage.createInstance({ name: 'lfwm-editors' });
  readonly forage_map = new Map<string, LocalForage>();

  forage(project_id: string) {
    let ret = this.forage_map.get(project_id)
    if (!ret) this.forage_map.set(project_id, ret = localforage.createInstance({ name: `lfwm-project-${project_id}` }))
    return ret;
  }
  async list_projects(): Promise<IProjectInfo[]> {
    const ret = await this.global_forage.getItem<IProjectInfo[]>(SK_PROJECTS);
    return ret || []
  }
  async save_projects(projects: IProjectInfo[]): Promise<void> {
    await this.global_forage.setItem<IProjectInfo[]>(SK_PROJECTS, projects);
  }
  async project(project_id: string): Promise<IProjectInfo | undefined> {
    const projects = await this.global_forage.getItem<IProjectInfo[]>(SK_PROJECTS);
    const project = projects?.find(v => v.id === project_id);
    return project
  }

  async new_project(): Promise<IEditorsState> {
    const cd = dayjs().format('YYYY-MM-DD HH:mm:ss.SSS');
    const project: IProjectInfo = {
      id: crypto.randomUUID(),
      name: 'project_' + cd,
      create_date: cd,
      modified_date: cd,
      open_date: cd
    };
    const projects = await this.list_projects();
    await this.global_forage.setItem(SK_PROJECTS, projects ? [project, ...projects] : [project]);
    return await this.open_project(project.id)
  }

  async del_project(project_id: string): Promise<boolean> {
    const prev = await this.list_projects();
    const next = prev.filter(v => v.id !== project_id)
    if (prev.length === next.length) return false;
    await this.global_forage.setItem(SK_PROJECTS, next)
    return true;
  }

  async import_files(project_id: string, files?: File[]): Promise<IEditorsState> {
    files = files || await open_file(true, '.dat,.txt')
    const project = await this.open_project(project_id);
    const valids: IEditorTreeNode[] = [];
    let text = '';
    for (const file of files) {
      const uuid: string = crypto.randomUUID();
      text = await read_dat_or_txt(file);
      const prev_state: IEditorState = { content: text }
      await this.forage(project_id).setItem<IEditorState>('editor_state_' + uuid, prev_state)
      const a = file.name.split('.').filter(Boolean);
      const type = a.length > 1 ? `.${a[a.length - 1].toLowerCase()}` : ''
      valids.push({
        id: uuid, type: type, name: file.name, depth: 0, children: []
      })
    }
    const { tabs, clicks, trees } = project
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
    project.tabs = next_tabs;
    project.tab = last.id;
    project.clicks = next_clicks;
    project.trees = next_trees
    return project;
  }

  async open_project(project_id?: string): Promise<IEditorsState> {
    const projects = await this.list_projects()
    const project = project_id ?
      projects.find(v => v.id == project_id) :
      [...projects].sort((a, b) => ('' + a.open_date) > ('' + b.open_date) ? 1 : -1).at(0)

    const state = project ?
      await this
        .forage(project.id)
        .getItem<IEditorsState>(`editors_state`)
        .then(r => r ?? { ...init_editor_state }) : {
        ...init_editor_state,
      }
    if (project) {
      project.open_date = dayjs().format('YYYY-MM-DD HH:mm:ss.SSS')
      await this.save_projects(projects)
    }
    state.projects = projects;
    state.project = project?.id;
    return state
  }

  async open_file(project_id: string, tab: IEditorTab): Promise<IEditorsState> {
    const project = await this.open_project(project_id);
    let next_tabs: IEditorTab[] = project.tabs;
    const exist = project.tabs.find(v => v.id === tab.id);
    if (!exist) next_tabs = [...project.tabs, tab];
    const clicks = [...project.clicks, tab.id];
    return {
      ...project,
      tab: tab.id,
      clicks: clicks,
      tabs: next_tabs,
    }
  }

  async close_file(project_id: string, tab: IEditorTab): Promise<IEditorsState> {
    const project = await this.open_project(project_id);
    const { tabs, clicks } = project;
    const idx = tabs.findIndex(v => v.id == tab.id);
    const next_clicks = clicks.filter(v => v != tab.id)
    const next_tabs = tabs.filter(v => v.id != tab.id)
    const last = next_clicks[next_clicks.length - 1]
    const next_actived = next_tabs.find(v => v.id == last) ?? next_tabs[idx] ?? next_tabs[idx - 1];
    return {
      ...project,
      tabs: next_tabs,
      clicks: next_clicks,
      tab: next_actived?.id ?? '',
    }
  }

  save_editor_state(project_id: string, tab: IEditorTab, editor: IEditor): Promise<void> {
    const state: IEditorState = {
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
    console.debug(`${TAG} save_editor_state(${project_id}, tab=${tab.id}) state=`, state)

    return this.open_project(project_id).then(({ tabs }) => {
      if (!tabs.some(v => v.id === tab.id)) throw new Error('not my tab!');
      const forage = this.forage(project_id);
      return forage.setItem<IEditorState>('editor_state_' + tab.id, state);
    }).then(() => {
      console.debug(`${TAG} save_editor_state, done`)
    })
  }

  async load_editor_state(project_id: string, tab: IEditorTab, editor: IEditor) {
    const project = await this.open_project(project_id);
    if (!project) return;
    if (!project.tabs.some(v => v.id === tab.id)) return;

    const forage = this.forage(project_id);
    forage
      .getItem<IEditorState>('editor_state_' + tab.id)
      .then(state => {
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
        console.debug(`${TAG} load_editor_state, done`)
      }).catch(e => {
        console.warn(e)
      })
  }
}
