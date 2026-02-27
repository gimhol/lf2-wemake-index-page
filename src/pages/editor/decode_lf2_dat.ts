const pwd = "SiuHungIsAGoodBearBecauseHeIsVeryGood";
const head_placeholder_length = 123;
function decode(buf: { [i in number]: number }, len: number) {
  for (let i = 0; i < len; ++i) buf[i] -= pwd.charCodeAt(i % pwd.length);
}
function encode(buf: { [i in number]: number }, len: number) {
  for (let i = 0; i < len; ++i) buf[i] += pwd.charCodeAt(i % pwd.length);
}

const chunk = 8 * 1024
export async function decode_lf2_dat(
  array_buffer: ArrayBuffer,
): Promise<string> {
  const buf = new Uint8Array(array_buffer);
  decode(buf, buf.byteLength);
  const char_code_arr = Array.from(buf);
  char_code_arr.splice(0, head_placeholder_length);

  let str = '';
  let i;
  for (i = 0; i < char_code_arr.length / chunk; i++) {
    str += String.fromCharCode.apply(null, char_code_arr.slice(i * chunk, (i + 1) * chunk));
  }
  str += String.fromCharCode.apply(null, char_code_arr.slice(i * chunk));
  return str;
}

export async function encode_lf2_dat(text: string): Promise<ArrayBuffer> {
  const chars = Array.from(text).map(char => char.charCodeAt(0));
  const head = new Array(head_placeholder_length).fill(0);
  const full = [...head, ...chars];
  const buf = new Uint8Array(full);
  encode(buf, buf.byteLength);
  return buf.buffer;
}

export function save_to_file(buffer: ArrayBuffer, fileName: string, type = 'application/octet-stream') {
  const blob = new Blob([buffer], { type });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = fileName;
  link.click();
  URL.revokeObjectURL(link.href);

}