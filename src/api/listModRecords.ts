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
  type?: 'dir' | 'mod' | 'file' | 'omod' | 'root' | '';
  content_type?: string;
  url?: string;
  size?: number;
  oss_name?: string;
  status?: 'published' | 'publishing' | 'unpublishing' | 'reviewing'
  brief?: string;
}

export const is_dir = (f: IFileInfo | undefined | null) => {
  if (!f) return false;
  return f.type == 'mod' || f.type == 'omod' || f.type == 'root' || f.type == 'dir'
}
export const is_info = (f: IFileInfo | undefined | null) => {
  if (!f) return false;
  return f.type == 'mod' || f.type == 'omod' || f.type == 'root'
}
export interface IListModRecordsBody {
  parent?: number;
  id?: number;
}
export async function listModRecords(body?: IListModRecordsBody, opts?: RequestInit): Promise<IFileInfo[]> {
  const r = await ApiHttp.post(`${API_BASE}lfwm/mine`, null, body ?? {}, opts);
  return r.data;
}


