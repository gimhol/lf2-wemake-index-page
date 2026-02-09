import type { IGlobalValue } from "./IGlobalValue";

export const init_value: IGlobalValue = (() => {
  const ret: IGlobalValue = {};
  const raw_str = localStorage.getItem('global_value');
  if (!raw_str) return ret;
  try {
    const r = JSON.parse(raw_str);
    if (Array.isArray(r) || typeof r !== 'object')
      throw new Error('failed to parse global_value');
    if (typeof r.sesson_id === 'string') ret.sesson_id = r.sesson_id;
    return ret;
  } catch (e) {
    console.error(e);
    localStorage.removeItem('global_value');
    return ret;
  }
})();
