import { ApiHttp } from "@/network/ApiHttp";
export interface IAddModFileBody {
  overwrite?: 1 | 0;
  name: string;
  content_type?: string;
  parent?: number;
  type?: 'mod' | 'file';
  url?: string;
  oss_name?: string;
  size?: number;
}
export async function addModFile(body: IAddModFileBody, opts?: RequestInit): Promise<number> {
  const r = await ApiHttp.post(`${API_BASE}lf2wmods/create`, null, body, opts);
  return Number(r.data);
}
