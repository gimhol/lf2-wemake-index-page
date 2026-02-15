import { ApiHttp } from "@/network/ApiHttp";
import type { IFileInfo } from "./listModRecords";
export interface IListModRecordsBody {
  path?: number[]
}
export async function listModPath(body?: IListModRecordsBody, opts?: RequestInit): Promise<IFileInfo[]> {
  const r = await ApiHttp.post(`${API_BASE}lfwm/path`, null, body ?? {}, opts);
  return r.data;
}


