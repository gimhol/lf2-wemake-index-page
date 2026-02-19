import { ApiHttp } from "@/network/ApiHttp";
export const dir_types: Readonly<RecordType[]> = ['dir', 'mod', 'omod', 'product', 'version']
export const info_types: Readonly<RecordType[]> = ['mod', 'omod', 'product', 'version']
export interface IRecord {
  id?: number;
  create_time?: string;
  modify_time?: string;
  owner_id?: number;
  name?: string;
  deleted?: number;
  parent?: number;
  path?: string;
  type?: RecordType;
  content_type?: string;
  url?: string;
  size?: number;
  oss_name?: string;
  status?: 'published' | 'publishing' | 'unpublishing' | 'reviewing'
  brief?: string;
}

export const is_dir = (f: IRecord | undefined | null) => {
  if (!f?.type) return false;
  return dir_types.includes(f.type)
}
export const is_publishable = (f: IRecord | undefined | null) => {
  if (!f?.type) return false;
  return info_types.includes(f.type)
}
export const children_type = (f: IRecord | undefined | null): RecordType[] | undefined => {
  if (!f?.type) return undefined;
  switch (f.type) {
    case "product": return ['version', 'file']
    case "mod": return ['file']
    case "omod": return ['file']
    case "dir": return ['dir', 'file', "omod", "mod", "product"]
  }
  return undefined;
}
export interface IListModRecordsBody {
  parent?: number;
  id?: number;
}
export async function listModRecords(body?: IListModRecordsBody, opts?: RequestInit): Promise<IRecord[]> {
  const r = await ApiHttp.post(`${API_BASE}lfwm/mine`, null, body ?? {}, opts);
  return r.data;
}


