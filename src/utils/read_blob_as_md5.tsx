import { MD5 } from "crypto-js";
import { read_blob_as_bin_str } from "./read_blob_as_bin_str";

export async function read_blob_as_md5(blob: Blob): Promise<string> {
  const result = await read_blob_as_bin_str(blob);
  return MD5(result).toString();
}
