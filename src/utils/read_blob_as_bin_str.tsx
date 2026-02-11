import { read_blob_as_array_buffer } from "./read_blob_as_array_buffer";

export async function read_blob_as_bin_str(blob: Blob): Promise<string> {
  const result = await read_blob_as_array_buffer(blob);
  return [...new Uint8Array(result)].map(v => String.fromCharCode(v)).join('');
}
