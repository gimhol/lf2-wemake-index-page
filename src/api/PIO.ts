export interface IPIOOpts {
  cache?: boolean
}
export class PIO<K, V> {
  readonly opts: Readonly<IPIOOpts>;
  readonly pendings = new Map<K, [(v: V) => void, (e: unknown) => void][]>();
  readonly caches = new Map<K, V>();
  constructor(opts: IPIOOpts = {}) {
    this.opts = Object.seal({ ...opts });
  }
  fetch(key: K, fallback: () => Promise<V>): Promise<V> {
    if (this.opts.cache) {
      const cache = this.caches.get(key);
      if (cache) return Promise.resolve(cache);
    }
    return new Promise<V>((a, b) => {
      let pendings = this.pendings.get(key);
      if (!pendings) this.pendings.set(key, pendings = []);
      pendings.push([a, b]);
      if (pendings.length > 1) return;
      fallback().then(r => {
        this.pendings.delete(key);
        if (this.opts.cache) this.caches.set(key, r);
        pendings.forEach(v => v[0](r));
      }).catch(e => {
        this.pendings.delete(key);
        pendings.forEach(v => v[1](e));
      });
    });
  }
}
