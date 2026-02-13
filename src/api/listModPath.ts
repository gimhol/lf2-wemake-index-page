import { ApiHttp } from "@/network/ApiHttp";
import type { IFileInfo } from "./listModFiles";
export interface IListModFilesBody {
  path?: number[]
}
export async function listModPath(body?: IListModFilesBody, opts?: RequestInit): Promise<IFileInfo[]> {
  const r = await ApiHttp.post(`${API_BASE}lf2wmods/path`, null, body ?? {}, opts);
  return r.data;
}


