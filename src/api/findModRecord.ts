import { ApiHttp } from "@/network/ApiHttp";
import type { IRecord } from "./listModRecords";
export interface IFindModRecordParams {
  id: number;
}
export async function findModRecord(params: IFindModRecordParams, opts?: RequestInit): Promise<IRecord> {
  const r = await ApiHttp.get(`${API_BASE}lfwm/find`, params, opts);
  return r.data;
}
