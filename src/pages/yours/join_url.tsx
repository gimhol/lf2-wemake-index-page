export function join_url(...parts: unknown[]) {
  let ret = '';
  for (const v of parts) {
    const part = '' + v;
    if (!ret) {
      ret = part;
      continue;
    }
    const a = ret.endsWith('/');
    const b = part.startsWith('/');
    if (a && b) ret += part.substring(1);
    else if (!a && !b) ret += '/' + part;
    else ret += part;
  }
  return ret;
}

export function replace_one<T>(prev: (T[]) | undefined, fn: (v: T) => T | undefined | null) {
  if (!prev?.length) return prev;
  for (let i = 0; i < prev.length; i++) {
    const item = fn(prev[i]);
    if (item === void 0 || item === null) continue;
    const next = [...prev];
    next[i] = item;
    return next
  }
  return prev;
}