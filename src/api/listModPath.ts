import { ApiHttp } from "@/network/ApiHttp";
import type { IRecord } from "./listModRecords";
export interface IListModRecordsBody {
  path?: number[]
}
export async function listModPath(body?: IListModRecordsBody, opts?: RequestInit): Promise<IRecord[]> {
  const r = await ApiHttp.post(`${API_BASE}lfwm/path`, null, body ?? {}, opts);
  return r.data;
}


