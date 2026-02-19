import { findModRecord } from "@/api/findModRecord";
import { getUserInfo, type IUserInfo } from "@/api/getUserInfo";
import { type IRecord } from "@/api/listModRecords";
import { Info, type IInfo } from "@/base/Info";
import { MD5 } from "crypto-js";
import { join_url } from "./join_url";

export function get_mod_paths_names(owner_id: number, mod_id: number) {
  const dir = `user/${owner_id}/${mod_id}`;
  // const info_obj_name = MD5(`${mod_id}/info`).toString()
  const data_obj_name = MD5(`${mod_id}/data`).toString()
  const desc_obj_name = MD5(`${mod_id}/desc`).toString()
  const children_obj_name = MD5(`${mod_id}/children`).toString()
  // const info_obj_path = dir + '/' + info_obj_name
  const data_obj_path = dir + '/' + data_obj_name
  const desc_obj_path = dir + '/' + desc_obj_name
  const children_obj_path = dir + '/' + children_obj_name
  return {
    // info_obj_name,
    data_obj_name,
    desc_obj_name,
    children_obj_name,
    // info_obj_path,
    data_obj_path,
    desc_obj_path,
    children_obj_path
  }
}
export interface IGetModFormOpts {
  mod_id?: number;
}
export interface IMod {
  info: Info;
  record: IRecord;
  owner: IUserInfo;
  strings: ReturnType<typeof get_mod_paths_names>
}
const TAG = '[get_mod]'
export async function get_mod(opts: IGetModFormOpts): Promise<IMod> {
  console.debug(`${TAG} opts:`, opts)
  const { mod_id } = opts;
  if (!mod_id) throw new Error(`${TAG} mod_id got ${mod_id}`);
  const record = await findModRecord({ id: mod_id });
  const { owner_id, oss_name } = record;
  if (!owner_id) throw new Error('mod not found!');
  const owner = await getUserInfo({ id: record.owner_id });
  const raw_info: IInfo = {
    author_url: owner?.home_url || owner?.gitee_url || owner?.github_url,
    author: owner.username || owner.username,
    title: record.name,
    type: record.type,
  }
  if (oss_name) {
    const exists_info = await fetch(join_url(STORAGE_URL_BASE, oss_name)).then<IInfo>(r => {
      if (!r.ok) throw new Error(`[${r.status}]${r.statusText}`)
      return r.json()
    })
    console.debug(`[get_mod] exists_info:`, exists_info)
    Object.assign(raw_info, exists_info)
  } else {
    console.debug(`[get_mod] info not exists, will make an empty one.`)
  }
  const strings = get_mod_paths_names(owner.id, mod_id);
  const info = new Info(raw_info, '', null, oss_name || null);
  info.id = '' + mod_id;
  return { strings, info, record, owner };
}

