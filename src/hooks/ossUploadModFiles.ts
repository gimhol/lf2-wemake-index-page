import { addModFile } from "@/api/addModFile";
import { read_blob_as_md5 } from "@/utils/read_blob_as_md5";
import { ossUploadFiles, type IOssUploadImagesOpts } from "./ossUploadFiles";

export interface IOssUploadModFilesOpts extends Omit<IOssUploadImagesOpts, 'getObjectName'> {
  mod_id?: number;
}
export async function ossUploadModFiles(opts: IOssUploadModFilesOpts) {
  const { mod_id, ..._p } = opts;
  if (typeof mod_id !== 'number') throw new Error('mod_id not set');
  const getObjectName = async (f: File, sts: IOSSStsInfo) => {
    if (typeof mod_id !== 'number') throw new Error('mod_id not set')
    const md5 = await read_blob_as_md5(f);
    return `${sts.dir}/${mod_id}/${md5}`
  }
  const r = await ossUploadFiles({ ..._p, getObjectName });
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
