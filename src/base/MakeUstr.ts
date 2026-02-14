/* eslint-disable @typescript-eslint/no-explicit-any */

export type KeysOfValue<T, D> = { [K in keyof T]: T[K] extends D ? K : never }[keyof T];

export interface II18NCls {
  get_str<V extends string = string>(k: KeysOfValue<this, string | undefined>): V | undefined;
  set_str<V extends string = string>(k: KeysOfValue<this, string | undefined>, v: V | undefined): this;
}
export type TStr<T extends string = string> = T | undefined;
export type TSetStr<V, T extends string = string> = (v: T | undefined) => V;

export function makeI18N() {
  const fields = new Set<string>();
  function Str(_: unknown, desc: ClassFieldDecoratorContext<any, string | undefined> & {
    name: any;
    static: false;
  }) {
    const { name } = desc;
    if (desc.kind !== 'field' || desc.static || typeof name !== 'string') return
    fields.add(name)
  }
  function Cls(cls: any) {
    class A extends cls {
      constructor(...args: any[]) {
        super(...args);
        for (const field of fields) {
          this[`set_${field}`] = function (v: any) {
            this[field] = v;
            return this;
          }
          Object.defineProperty(this, field, {
            get: () => this.get_str(field),
            set: (v) => this.set_str(field, v),
          })
        }
      }
    }
    return A as any
  }
  return { Cls, Str }
}

