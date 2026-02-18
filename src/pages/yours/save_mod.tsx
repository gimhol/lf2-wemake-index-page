// import { addModRecord } from "@/api/addModRecord";
// import { findModRecord } from "@/api/findModRecord";
// import { getUserInfo } from "@/api/getUserInfo";
import type { Info } from "@/base/Info";
import { read_blob_as_md5 } from "@/utils/read_blob_as_md5";
import type OSS from "ali-oss";
import { join_url } from "./join_url";
import { editModRecord } from "@/api/editModRecord";

export interface ISaveModFormOpts {
  mod_id?: number;
  oss?: OSS;
  sts?: IOSSStsInfo;
  info?: Info;
}

const TAG = '[save_mod]'
export async function save_mod(opts: ISaveModFormOpts) {
  console.debug(`${TAG} opts:`, opts)
  const { mod_id, oss, sts, info } = opts;
  if (!mod_id) throw new Error(`${TAG} mod_id got ${mod_id}`);
  if (!sts) throw new Error(`${TAG} oss got ${oss}`);
  if (!oss) throw new Error(`${TAG} sts got ${oss}`);
  if (!info) throw new Error(`${info} info got ${info}`);

  info.id = '' + mod_id
  const json_blob = new Blob([JSON.stringify(info.raw)], { type: 'application/json; charset=utf-8' })

  const oss_name = join_url(sts.dir, mod_id, await read_blob_as_md5(json_blob))
  await oss.put(oss_name, json_blob)
  await editModRecord({ id: mod_id, oss_name, brief: info.brief })

  // const record = await findModRecord({ id: mod_id });
  // const { owner_id } = record;
  // if (!owner_id) throw new Error('mod not found!');
  // const owner = await getUserInfo({ id: record.owner_id });

  // addModRecord({
  //   overwrite: 1,
  //   name: "",
  // })
}
