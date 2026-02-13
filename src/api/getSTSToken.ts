import { ApiHttp } from "@/network/ApiHttp";
import { PIO } from "./PIO";
import GlobalStore from "@/GlobalStore";
export interface IOSSStsInfo {
  accessKeyId: string;
  accessKeySecret: string;
  expiration: string;
  securityToken: string;
  bucket: string;
  dir: string;
  base: string;
}

export const sts_pio = new PIO<string, IOSSStsInfo>({ cache: true });
sts_pio.name = 'sts_pio'
sts_pio.debug = !0
export function getSTSToken(opts?: RequestInit): Promise<IOSSStsInfo> {
  const url = `${API_BASE}lf2wmods/oss_sts`
  const job = () => ApiHttp.post(url, null, null, opts).then(r => r.data)
  return sts_pio.fetch(GlobalStore.store.value.session_id, job)
}