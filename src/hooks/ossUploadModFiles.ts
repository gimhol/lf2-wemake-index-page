import { addModFile } from "@/api/addModFile";
import { read_blob_as_md5 } from "@/utils/read_blob_as_md5";
import type OSS from "ali-oss";
import { ossUploadFiles } from "./ossUploadFiles";

export interface IOssUploadModFilesOpts {
  mod_id?: number;
  sts?: IOSSStsInfo;
  oss?: OSS | null;
  files?: File[];
}
export async function ossUploadModFiles(opts: IOssUploadModFilesOpts) {
  const { mod_id, files, oss, sts } = opts;
  if (!mod_id) throw new Error('mod_id not set');
  const getObjectName = async (f: File, sts: IOSSStsInfo) => {
    if (!mod_id) throw new Error('mod_id not set')
    const md5 = await read_blob_as_md5(f);
    return `${sts.dir}/${mod_id}/${md5}`
  }
  const r = await ossUploadFiles({ oss, sts, files, getObjectName });
  for (const { file, result } of r.list) {
    await addModFile({
      overwrite: 1,
      name: file.name,
      content_type: file.type,
      parent: mod_id,
      type: 'file',
      url: r.sts.base + result.name,
      oss_name: result.name,
      size: file.size,
    });
  }
  return r.list.map(v => ({
    url: r.sts.base + v.result.name,
    alt: v.file.name,
    title: v.file.name
  }));

}
