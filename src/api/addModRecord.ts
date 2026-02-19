import { ApiHttp } from "@/network/ApiHttp";
export interface IAddModRecordBody {
  overwrite?: 1 | 0;
  name: string;
  content_type?: string;
  parent?: number;
  type?: RecordType;
  url?: string;
  oss_name?: string;
  size?: number;
}
export async function addModRecord(body: IAddModRecordBody, opts?: RequestInit): Promise<number> {
  const r = await ApiHttp.post(`${API_BASE}lfwm/create`, null, body, opts);
  return Number(r.data);
}
