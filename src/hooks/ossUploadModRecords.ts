import { addModRecord } from "@/api/addModRecord";
import { read_blob_as_md5 } from "@/utils/read_blob_as_md5";
import { ossUploadFiles, type IOssUploadFilesOpts } from "./ossUploadFiles";
import { join_url } from "@/pages/yours/join_url";

export interface IOssUploadModRecordsOpts extends IOssUploadFilesOpts {
  mod_id?: number;
}
export interface IUploadFileResult {
  url: string;
  alt: string;
  title: string;
}

export async function ossUploadModRecords(opts: IOssUploadModRecordsOpts): Promise<IUploadFileResult[]> {
  const {
    mod_id,
    getObjectName = async (f: File, sts: IOSSStsInfo) => {
      if (typeof mod_id !== 'number') throw new Error('mod_id not set')
      const md5 = await read_blob_as_md5(f);
      if (sts.dir) join_url(sts.dir, mod_id, md5)
      return `${mod_id}/${md5}`
    }, ..._p } = opts;
  if (typeof mod_id !== 'number') throw new Error('mod_id not set');
  const r = await ossUploadFiles({ ..._p, getObjectName });
  const base = r.sts.base.endsWith('/') ? r.sts.base.substring(0, r.sts.base.length - 1) : r.sts.base
  for (const { file, result } of r.list) {
    await addModRecord({
      overwrite: 1,
      name: file.name,
      content_type: file.type,
      parent: mod_id,
      type: 'file',
      url: join_url(base, result.name),
      oss_name: result.name,
      size: file.size,
    });
  }
  return r.list.map(v => ({
    url: join_url(base, v.result.name),
    alt: v.file.name,
    title: v.file.name
  }));

}
