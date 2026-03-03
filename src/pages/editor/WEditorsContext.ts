import dayjs from 'dayjs';
import { forage } from './init';

const SK_PROJECTS = 'projects' as const;

export interface IProjectInfo {
  id: string,
  name: string;
  create_date: string;
  modified_date: string;
  open_date: string;
}
export interface IEditorGroup{}

export class WEditorsContext {
  readonly forage = forage;
  async projects(): Promise<IProjectInfo[]> {
    const ret = await this.forage.getItem<IProjectInfo[]>(SK_PROJECTS);
    return ret || []
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
    await this.forage.setItem(SK_PROJECTS, projects ? [project, ...projects] : [project]);
    return project
  }
  async del_project(id: string): Promise<boolean> {
    const prev = await this.projects();
    const next = prev.filter(v => v.id !== id)
    if (prev.length === next.length) return false;
    await this.forage.setItem(SK_PROJECTS, next)
    return true;
  }

}
