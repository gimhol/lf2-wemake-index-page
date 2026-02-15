import { ApiHttp } from "@/network/ApiHttp";
import type { IFileInfo } from "./listModRecords";
export interface IFindModRecordParams {
  id: number;
}
export async function findModRecord(params: IFindModRecordParams, opts?: RequestInit): Promise<IFileInfo> {
  const r = await ApiHttp.get(`${API_BASE}lfwm/find`, params, opts);
  return r.data;
}
