import { ApiHttp } from "@/network/ApiHttp";
export interface IFileInfo {
  id?: number;
  create_time?: string;
  modify_time?: string;
  owner_id?: number;
  name?: string;
  deleted?: number;
  parent?: number;
  path?: string;
  type?: 'dir' | 'mod' | 'file';
  content_type?: string;
  url?: string;
  size?: number;
  oss_name?: string;
}

export interface IListModFilesBody {
  parent?: number
}
export async function listModFiles(body?: IListModFilesBody, opts?: RequestInit): Promise<IFileInfo[]> {
  const r = await ApiHttp.post(`${API_BASE}lf2wmods/mine`, null, body ?? {}, opts);
  return r.data;
}