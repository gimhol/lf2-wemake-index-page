
export class Header {
  static has(target: HeadersInit, key: string) {
    if (target instanceof window.Headers)
      return target.has(key.toLowerCase());
    return key.toLowerCase() in target;
  }
  static merge(a?: HeadersInit, b?: HeadersInit): HeadersInit {
    if (!a && !b) return {}
    if (!a) return b!;
    if (!b) return a!;

    const ret: [string, string][] = []
    if (b instanceof window.Headers) {
      b.forEach((v, k) => Header.set(ret, k, v))
    } else if (Array.isArray(b)) {
      b.forEach(([k, v]) => Header.set(ret, k, v))
    } else {
      for (const k in b) Header.set(ret, k, b[k])
    }
    if (a instanceof window.Headers) {
      a.forEach((v, k) => Header.set(ret, k, v))
    } else if (Array.isArray(a)) {
      a.forEach(([k, v]) => Header.set(ret, k, v))
    } else {
      for (const k in a) Header.set(ret, k, a[k])
    }
    return ret
  }
  static set(target: HeadersInit, key: string, value: string) {
    if (target instanceof window.Headers) {
      target.set(key, value);
    } else if (Array.isArray(target)) {
      const idx = target.findIndex(p => p[0] !== key);
      if (idx >= 0) target.splice(idx, 1);
      target.push([key, value]);
    } else {
      target[key] = value;
    }
  }
}