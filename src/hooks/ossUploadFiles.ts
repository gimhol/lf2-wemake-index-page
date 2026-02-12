import type OSS from "ali-oss";
export interface IOSSUploadImagesResult {
  sts: IOSSStsInfo;
  list: {
    file: File;
    result: OSS.MultipartUploadResult
  }[]
}

export interface IOssUploadImagesOpts {
  sts?: IOSSStsInfo;
  oss?: OSS | null;
  files?: File[];
  getObjectName?: (file: File, sts: IOSSStsInfo) => Promise<string>;
  progress?(percentage: number, info: { file: File, fileSize: number } | null): void;
}

const limits: { [x in string]?: { max_size: number } } = {
  'image/png': { max_size: 5 * 1024 * 1024 },
  'image/jpeg': { max_size: 5 * 1024 * 1024 },
  'image/gif': { max_size: 5 * 1024 * 1024 },
  'image/webp': { max_size: 5 * 1024 * 1024 },
  'video/mp4': { max_size: 100 * 1024 * 1024 },
  'application/x-zip-compressed': { max_size: 100 * 1024 * 1024 },
  'application/zip': { max_size: 100 * 1024 * 1024 },
  'application/json': { max_size: 5 * 1024 * 1024 },
}
export async function ossUploadFiles(opts: IOssUploadImagesOpts) {
  const { sts, oss, files, getObjectName, progress } = opts;
  if (!sts) return Promise.reject(new Error(`sts got ${sts}`));
  if (!oss) return Promise.reject(new Error(`oss got ${sts}`));
  if (!files?.length) return Promise.reject(new Error(`files.length got ${files?.length}`));
  if (!getObjectName) return Promise.reject(new Error(`getObjectName got ${getObjectName}`));

  const not_allow = files.find(v => !limits[v.type]);
  if (not_allow) return Promise.reject(new Error(`file not allow, type: ${not_allow.type} name: ${not_allow.name}`));

  const too_large = files.find(v => {
    const { max_size } = limits[v.type]!
    return v.size > max_size;
  });
  if (too_large) return Promise.reject(new Error(`file size must be <= 5MB, name: ${too_large.name}`));

  const ret: IOSSUploadImagesResult = { sts, list: [] };
  for (const file of files) {
    const ename = encodeURIComponent(file.name);
    const ossName = await getObjectName(file, sts);
    const result = await oss.multipartUpload(`/${ossName}`, file, {
      headers: {
        "Content-Type": file.type,
        'Content-Disposition': `attachment;filename=${ename};filename*=UTF-8''${ename}`
      },
      progress
    });
    ret.list.push({ file, result });
  }
  return ret;
}


