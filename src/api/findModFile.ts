import { ApiHttp } from "@/network/ApiHttp";
import type { IFileInfo } from "./listModFiles";
export interface IFindModFileParams {
  id: number;
}
export async function findModFile(params: IFindModFileParams, opts?: RequestInit): Promise<IFileInfo> {
  const r = await ApiHttp.get(`${API_BASE}lf2wmods/find`, params, opts);
  return r.data;
}
