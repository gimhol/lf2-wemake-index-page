import { ApiHttp } from "@/network/ApiHttp";

export type ModRecordType = 'mod' | 'omod' | 'file';
export interface IEditModRecordBody {
  id?: number;
  name?: string;
  content_type?: string;
  parent?: number;
  type?: ModRecordType;
  url?: string;
  oss_name?: string;
  size?: number;
}
export async function editModRecord(body: IEditModRecordBody, opts?: RequestInit): Promise<number> {
  const r = await ApiHttp.post(`${API_BASE}lfwm/update`, null, body, opts);
  return Number(r.data);
}
