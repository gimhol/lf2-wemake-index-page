import { ApiHttp } from "@/network/ApiHttp";

export type ModRecordType = 'mod' | 'omod' | 'file';
export interface IAddModRecordBody {
  overwrite?: 1 | 0;
  name: string;
  content_type?: string;
  parent?: number;
  type?: ModRecordType;
  url?: string;
  oss_name?: string;
  size?: number;
}
export async function addModRecord(body: IAddModRecordBody, opts?: RequestInit): Promise<number> {
  const r = await ApiHttp.post(`${API_BASE}lf2wmods/create`, null, body, opts);
  return Number(r.data);
}
