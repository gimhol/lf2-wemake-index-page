import A from "crypto-js";
import { read_blob_as_array_buffer } from "./read_blob_as_array_buffer";
export async function read_blob_as_bin_str(blob: Blob): Promise<A.lib.WordArray> {
  const result = await read_blob_as_array_buffer(blob);
  return A.lib.WordArray.create(result)
}
