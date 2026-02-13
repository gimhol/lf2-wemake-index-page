import type OSS from "ali-oss";
export interface IOSSUploadImagesResult {
  sts: IOSSStsInfo;
  list: {
    file: File;
    result: OSS.MultipartUploadResult
  }[]
}

export interface IOssUploadFilesOpts {
  sts?: IOSSStsInfo;
  oss?: OSS | null;
  files?: File[];
  getObjectName?: (file: File, sts: IOSSStsInfo) => Promise<string>;
  progress?(percentage: number, info: { file: File, fileSize: number } | null): void;
  limits?: { [x in string]?: { max_size: number } };
}

const limits: { [x in string]?: { max_size: number } } = {
  'image/png': { max_size: 5 * 1024 * 1024 },
  'image/jpeg': { max_size: 5 * 1024 * 1024 },
  'image/webp': { max_size: 5 * 1024 * 1024 },
  //
  'image/gif': { max_size: 5 * 1024 * 1024 },
  'video/mp4': { max_size: 100 * 1024 * 1024 },
  'application/x-zip-compressed': { max_size: 100 * 1024 * 1024 },
  'application/zip': { max_size: 100 * 1024 * 1024 },
  'application/json': { max_size: 5 * 1024 * 1024 },
}

function test_limit(files: File[], limits: { [x in string]?: { max_size: number } }) {
  const not_allow = files.find(v => !limits[v.type]);
  if (not_allow) throw new Error(`file not allow, type: ${not_allow.type} name: ${not_allow.name}`);
  const too_large = files.find(v => {
    const { max_size } = limits[v.type]!
    if (!max_size) return false
    return v.size > max_size;
  });
  if (too_large) throw new Error(`file size must be <= 5MB, name: ${too_large.name}`);
}
export async function ossUploadFiles(opts: IOssUploadFilesOpts) {
  const { sts, oss, files, getObjectName, progress } = opts;
  if (!sts) throw new Error(`sts got ${sts}`);
  if (!oss) throw new Error(`oss got ${sts}`);
  if (!files?.length) throw new Error(`files.length got ${files?.length}`);
  if (!getObjectName) throw new Error(`getObjectName got ${getObjectName}`);

  if (opts.limits) test_limit(files, opts.limits)
  test_limit(files, limits)

  const ret: IOSSUploadImagesResult = { sts, list: [] };
  for (const file of files) {
    const ossName = await getObjectName(file, sts);
    const result = await oss.multipartUpload(`/${ossName}`, file, {
      headers: {
        "Content-Type": file.type,
        'Content-Disposition': get_content_disposition(file.name)
      },
      progress
    });
    ret.list.push({ file, result });
  }
  return ret;
}
export function get_content_disposition(file_name: string) {
  const ename = encodeURIComponent(file_name);
  return `attachment;filename=${ename};filename*=UTF-8''${ename}`
}


