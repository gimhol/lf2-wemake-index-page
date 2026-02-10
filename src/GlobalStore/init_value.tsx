import { create_global_value, type IGlobalValue } from "./IGlobalValue";

export const init_value: IGlobalValue = (() => {
  const ret: IGlobalValue = create_global_value();
  const raw_str = localStorage.getItem('global_value');
  if (!raw_str) return ret;
  try {
    const r = JSON.parse(raw_str);
    if (Array.isArray(r) || typeof r !== 'object')
      throw new Error('failed to parse global_value');
    if (typeof r.session_id === 'string') ret.session_id = r.session_id;
    return ret;
  } catch (e) {
    console.error(e);
    localStorage.removeItem('global_value');
    return ret;
  }
})();
