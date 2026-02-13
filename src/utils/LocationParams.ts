/* eslint-disable @typescript-eslint/no-explicit-any */
import qs from "qs";
import { useMemo } from "react";
import * as rrd from "react-router-dom";

function useParams() {
  const params = rrd.useParams();
  return useMemo(() => new LocationParams(params, params), [params])
}
function useAll() {
  const location = rrd.useLocation();
  const params = rrd.useParams();
  return useMemo(() => ({
    search: LocationParams.parse(location.search),
    hash: LocationParams.parse(location.hash),
    params: new LocationParams(params, params),
  }), [location, params])
}

type QSParseOpts = qs.IParseOptions<qs.BooleanOptional> & { decoder?: never | undefined }
export class LocationParams {
  static readonly useParams = useParams
  static readonly useAll = useAll
  static parse(src: string, opts?: QSParseOpts) {
    let type: '#' | '?' | '&' | undefined;
    let str = src;
    const letter = src[0]
    switch (letter) {
      case '#': case '?': case '&':
        type = letter;
        str = src.substring(1);
        break;
    }
    return new LocationParams(src, qs.parse(str, opts), type)
  }

  private readonly map = new Map<string, any>();
  readonly src: any;
  readonly raw: { [key: string]: unknown; };
  readonly type: '#' | '?' | '&' | ''

  constructor(src: any, raw: ReturnType<typeof qs.parse>, type: '#' | '?' | '&' | '' = '') {
    this.src = src;
    this.type = type;
    this.raw = raw;
  }
  private save_cache<T>(cache_key: string, value: T) {
    this.map.set(cache_key, value);
    return value
  }
  private anys_to_nums(anys: any[]): number[] | undefined {
    const nums: number[] = [];
    for (const any of anys) {
      const num = Number(any)
      if (Number.isNaN(num))
        return void 0;
      nums.push(num)
    }
    return nums;
  }
  set(key: string, value: string): this {
    this.map.clear();
    this.raw[key] = value;
    return this
  }
  delele(...keys: string[]): this {
    this.map.clear();
    for (const k of keys) delete this.raw[k];
    return this
  }
  get_string(key: string): string | undefined;
  get_string(key: string, fallback: string): string;
  get_string(key: string, fallback?: string): string | undefined {
    const cache_key = `<str>${key}`
    if (this.map.has(cache_key)) return this.map.get(cache_key);
    const value = this.raw[key];
    if (value === void 0 || value === null) return this.save_cache(cache_key, fallback);
    return this.save_cache(cache_key, '' + value)
  }

  get_number(key: string): number | undefined;
  get_number(key: string, fallback: number): number;
  get_number(key: string, fallback?: number): number | undefined {
    const cache_key = `<num>${key}`
    if (this.map.has(cache_key)) return this.map.get(cache_key);
    const value = Number(this.raw[key]);
    if (Number.isNaN(value)) return this.save_cache(cache_key, fallback)
    return this.save_cache(cache_key, value)
  }
  get_strings(key: string, separator?: string): string[] | undefined;
  get_strings(key: string, separator: string, fallback: string[]): string[];
  get_strings(key: string, separator: string = ',', fallback?: string[]): string[] | undefined {
    const cache_key = `<strs(${separator})>${key}`
    if (this.map.has(cache_key)) return this.map.get(cache_key);
    const raw_value = this.raw[key];
    if (raw_value === null || raw_value === undefined)
      return this.save_cache(cache_key, fallback)
    if (Array.isArray(raw_value))
      return this.save_cache(cache_key, raw_value.map(v => '' + v))
    if (typeof raw_value === 'string')
      return this.save_cache(cache_key, raw_value.split(separator))
    return this.save_cache(cache_key, ['' + raw_value])
  }

  get_numbers(key: string, separator?: string): number[] | undefined;
  get_numbers(key: string, separator: string, fallback: number[]): number[];
  get_numbers(key: string, separator: string = ',', fallback?: number[]): number[] | undefined {
    const cache_key = `<nums(${separator})>${key}`
    if (this.map.has(cache_key)) return this.map.get(cache_key);
    const raw_value = this.raw[key];
    if (raw_value === null || raw_value === undefined)
      return this.save_cache(cache_key, fallback)
    if (Array.isArray(raw_value))
      return this.save_cache(cache_key, this.anys_to_nums(raw_value))
    if (typeof raw_value === 'string')
      return this.save_cache(cache_key, this.anys_to_nums(raw_value.split(separator)))
    return this.save_cache(cache_key, this.anys_to_nums([raw_value]))
  }

  to_query(): string {
    return qs.stringify(this.raw, { arrayFormat: 'comma', encode: true })
  }
  clone(): LocationParams {
    return new LocationParams(this.src, { ...this.raw }, this.type)
  }
}


