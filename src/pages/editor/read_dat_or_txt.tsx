import { decode_lf2_dat } from "./decode_lf2_dat";

export const read_dat_or_txt = async (file: File) => {
  const text = file.name.endsWith('.dat') ?
    await decode_lf2_dat(await file.arrayBuffer()) :
    await file.text();
  return text;
};
