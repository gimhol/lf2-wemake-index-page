import { ApiHttp } from "@/network/ApiHttp";
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
const jobs_map = new Map<number, [(v: IUserInfo) => void, (e: unknown) => void][]>()
const cache_map = new Map<number, IUserInfo>()
export function getUserInfo(body?: IListModFilesBody, opts?: RequestInit): Promise<IUserInfo> {
  const id = body?.id ?? 0;
  const cache = cache_map.get(id)
  if (cache) return Promise.resolve(cache)
  return new Promise<IUserInfo>((a, b) => {
    let jobs = jobs_map.get(id);
    if (!jobs) jobs_map.set(id, jobs = [])
    jobs.push([a, b])
    if (jobs.length > 1) return;
    ApiHttp
      .post(`${API_BASE}user/info`, body, {}, opts)
      .then(r => {
        jobs_map.delete(id)
        cache_map.set(r.data.id, r.data)
        jobs.forEach(v => v[0](r.data))
      }).catch(e => {
        jobs_map.delete(id)
        jobs.forEach(v => v[1](e))
      })
  })

}