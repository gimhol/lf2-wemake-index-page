import { ApiHttp } from "@/network/ApiHttp";
import { PIO } from "./PIO";
export interface IUserInfo {
  id: number;
  admin: number;
  username: string;
  nickname: string;
  email: string;
  gitee_url: string;
  github_url: string;
  home_url: string;
}
export interface IListModFilesBody {
  id?: number
}
export const user_info_pio = new PIO<number, IUserInfo>({ cache: true });
user_info_pio.name = 'user_info_pio'
user_info_pio.debug = false
export function getUserInfo(body?: IListModFilesBody, opts?: RequestInit): Promise<IUserInfo> {
  const id = body?.id ?? 0;
  const job = () => ApiHttp.post(`${API_BASE}user/info`, body, {}, opts).then(r => r.data);
  return user_info_pio.fetch(id, job)
}