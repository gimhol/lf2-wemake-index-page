// import { addModRecord } from "@/api/addModRecord";
// import { findModRecord } from "@/api/findModRecord";
// import { getUserInfo } from "@/api/getUserInfo";
import { addModRecord } from "@/api/addModRecord";
import { editModRecord } from "@/api/editModRecord";
import type { IInfo, Info } from "@/base/Info";
import { get_content_disposition } from "@/hooks/ossUploadFiles";
import { read_blob_as_md5 } from "@/utils/read_blob_as_md5";
import type OSS from "ali-oss";
import dayjs from "dayjs";
import { join_url } from "./join_url";

export interface ISaveModFormOpts {
  mod_id: number;
  owner_id: number;
  oss: OSS;
  info: Info;
}

const TAG = '[save_mod]'
export async function save_mod(opts: ISaveModFormOpts) {
  console.debug(`${TAG} opts:`, opts)
  const time = dayjs().format(`YYYY-MM-DD-HH-mm-ss-SSS`);
  const { mod_id, oss, info, owner_id } = opts;
  info.id = '' + mod_id;
  const m = new Map<string, string>();
  for (const [l, desc] of info.all_desc) {
    if (!desc) continue;
    const content_type = 'text/plain; charset=utf-8'
    const blob = new Blob([desc], { type: content_type })
    const oss_name = join_url(`user`, owner_id, mod_id, await read_blob_as_md5(blob))
    const file_name = ['desc', l, time, 'md'].filter(Boolean).join('.')
    await oss.put(oss_name, blob, {
      headers: {
        "Content-Type": blob.type,
        'Content-Disposition': get_content_disposition(file_name)
      },
    })
    await addModRecord({
      oss_name,
      overwrite: 1,
      parent: mod_id,
      name: file_name,
      content_type: blob.type,
      url: join_url(STORAGE_URL_BASE, oss_name),
      type: 'file'
    })
    m.set(l, oss_name)
  }
  const raw: IInfo = JSON.parse(JSON.stringify(info.raw))
  for (const [l, oss_name] of m) {
    if (l === '') {
      delete raw.desc;
      raw.desc_url = oss_name;
      continue;
    }
    if (!raw.i18n?.[l]) continue;
    delete raw.i18n[l].desc;
    raw.i18n[l].desc_url = oss_name;
  }
  const blob = new Blob([JSON.stringify(raw)], { type: 'application/json; charset=utf-8' })
  const oss_name = join_url('user', owner_id, mod_id, await read_blob_as_md5(blob))
  const file_name = ['desc', time, 'info.json'].filter(Boolean).join('.')
  await oss.put(oss_name, blob, {
    headers: {
      "Content-Type": blob.type,
      'Content-Disposition': get_content_disposition(file_name)
    },
  })
  await editModRecord({
    id: mod_id, oss_name, brief: info.brief,
    content_type: blob.type,
  })
}
