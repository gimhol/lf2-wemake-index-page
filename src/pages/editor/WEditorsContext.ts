import dayjs from 'dayjs';
import localforage from 'localforage';
import { init_editor_state, type IEditorsState, type IEditorState, type IEditorTab, type IEditorTreeNode } from './base';
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
  async projects(): Promise<IProjectInfo[]> {
    const ret = await this.global_forage.getItem<IProjectInfo[]>(SK_PROJECTS);
    return ret || []
  }
  async project(project_id: string): Promise<IProjectInfo | undefined> {
    const projects = await this.global_forage.getItem<IProjectInfo[]>(SK_PROJECTS);
    const project = projects?.find(v => v.id === project_id);
    return project
  }

  async new_project(): Promise<IProjectInfo> {
    const cd = dayjs().format('YYYY-MM-DD-HH-mm-ss-SSS');
    const project: IProjectInfo = {
      id: crypto.randomUUID(),
      name: 'project_' + cd,
      create_date: cd,
      modified_date: cd,
      open_date: cd
    };
    const projects = await this.projects();
    await this.global_forage.setItem(SK_PROJECTS, projects ? [project, ...projects] : [project]);
    return project
  }

  async del_project(id: string): Promise<boolean> {
    const prev = await this.projects();
    const next = prev.filter(v => v.id !== id)
    if (prev.length === next.length) return false;
    await this.global_forage.setItem(SK_PROJECTS, next)
    return true;
  }

  async import_files(project: string, files: File[]) {
    const items: IEditorTreeNode[] = [];
    let text = '';
    for (const file of files) {
      const uuid: string = crypto.randomUUID();
      text = await read_dat_or_txt(file);
      const prev_state: IEditorState = { content: text }
      await this.forage(project).setItem<IEditorState>('editor_state_' + uuid, prev_state)
      const a = file.name.split('.').filter(Boolean);
      const type = a.length > 1 ? `.${a[a.length - 1].toLowerCase()}` : ''
      items.push({
        id: uuid, type: type, name: file.name, depth: 0, children: []
      })
    }
    return items;
  }

  async open_project(project?: string): Promise<IEditorsState> {
    console.debug(`${TAG} open_project(${project})`)
    const projects = await this.projects()
    project = project ?? [...projects].sort((a, b) => ('' + a.open_date) > ('' + b.open_date) ? 1 : -1).at(0)?.id;
    const state = project ?
      await this
        .forage(project)
        .getItem<IEditorsState>(`editors_state`)
        .then(r => r ?? { ...init_editor_state }) : {
        ...init_editor_state,
      }
    state.projects = projects;
    state.project = project;
    console.debug(`${TAG} open_project(${project}): `, state)
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
}
