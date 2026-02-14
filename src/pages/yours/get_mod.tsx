import { findModFile } from "@/api/findModFile";
import { getUserInfo, type IUserInfo } from "@/api/getUserInfo";
import { type IFileInfo } from "@/api/listModFiles";
import { Info, type IInfo } from "@/base/Info";
import type OSS from "ali-oss";
import { MD5 } from "crypto-js";

export function get_mod_paths_names(owner_id: number, mod_id: number) {
  const dir = `user/${owner_id}/${mod_id}`;
  const info_obj_name = MD5(`${mod_id}/info`).toString()
  const cover_obj_name = MD5(`${mod_id}/cover`).toString()
  const data_obj_name = MD5(`${mod_id}/data`).toString()
  const desc_obj_name = MD5(`${mod_id}/desc`).toString()
  const children_obj_name = MD5(`${mod_id}/children`).toString()
  const info_obj_path = dir + '/' + info_obj_name
  const cover_obj_path = dir + '/' + cover_obj_name
  const data_obj_path = dir + '/' + data_obj_name
  const desc_obj_path = dir + '/' + desc_obj_name
  const children_obj_path = dir + '/' + children_obj_name
  return {
    info_obj_name,
    cover_obj_name,
    data_obj_name,
    desc_obj_name,
    children_obj_name,
    info_obj_path,
    cover_obj_path,
    data_obj_path,
    desc_obj_path,
    children_obj_path
  }
}
export interface IGetModFormOpts {
  mod_id?: number;
  oss?: OSS;
  sts?: IOSSStsInfo;
}
export interface IMod {
  info: Info;
  file: IFileInfo;
  owner: IUserInfo;
  strings: ReturnType<typeof get_mod_paths_names>
  cover?: { url: string; name: string }
}

export async function get_mod(opts: IGetModFormOpts): Promise<IMod> {
  const { mod_id, oss, sts } = opts;
  if (!mod_id || !oss || !sts) throw new Error('!');
  const mod_info = await findModFile({ id: mod_id });
  if (!mod_info.owner_id) throw new Error('mod not found!');

  const owner_info = await getUserInfo({ id: mod_info.owner_id });
  const paths_names = get_mod_paths_names(owner_info.id, mod_id);
  const raw_info = await oss.get(paths_names.info_obj_path).then<IInfo>(r => {
    return JSON.parse(new TextDecoder().decode(r.content));
  }).catch(e => {
    if (e.name !== 'NoSuchKeyError') throw e;
    return {} as IInfo;
  });

  const cover = await oss.get(paths_names.cover_obj_path).then(r => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const blob = new Blob([r.content], { type: (r.res.headers as any)['content-type'] });
    const url = URL.createObjectURL(blob);
    return {
      name: ' ',
      url: url,
    };
  }).catch(e => {
    if (e.name !== 'NoSuchKeyError') throw e;
    return void 0;
  });


  const info = new Info(raw_info, '', null, null);
  info.author_url = info.author_url || owner_info?.home_url || owner_info?.gitee_url || owner_info?.github_url;
  info.author = info.author || owner_info.username || owner_info.username;
  info.title = info.title || mod_info.name;
  return { strings: paths_names, info, file: mod_info, owner: owner_info, cover };
}
