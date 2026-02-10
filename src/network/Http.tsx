/* eslint-disable @typescript-eslint/no-explicit-any */
import qs from 'qs';
import * as KnownError from './KnownError';

interface IRequestInterceptor {
  (url: string, opts: RequestInit): Promise<[string, RequestInit]> | [string, RequestInit]
}
interface IResponseInterceptor {
  (resq: Response, url: string, opts: RequestInit): Promise<Response> | Response
}
interface IErrorInterceptor {
  (error: Error, resq: Response, url: string, opts: RequestInit): Promise<Error> | Error
}
export type TParams = Record<string, any>
export type TLikeGetMethods = 'GET' | 'HEAD' | 'OPTIONS' | 'DELETE'
export type TLikePutMethods = 'PUT' | 'PATCH' | 'POST'
export type TAllMethods = TLikeGetMethods | TLikePutMethods | 'TRACE' | 'CONNECT'
export class HTTP {
  ignoreAbort = async (e: any) => (typeof e?.message !== 'string' || e.message.indexOf("aborted") < 0) ? Promise.reject(e) : void 0

  private _requestInterceptors: IRequestInterceptor[] = [];
  removeRequestInterceptor(interceptor: IRequestInterceptor) {
    const idx = this._requestInterceptors.indexOf(interceptor);
    if (idx >= 0) this._requestInterceptors.splice(idx, 1);
  }
  addRequestInterceptor(interceptor: IRequestInterceptor) {
    this.removeRequestInterceptor(interceptor)
    this._requestInterceptors.push(interceptor)
    return () => this.removeRequestInterceptor(interceptor);
  }
  private _responseInterceptors: IResponseInterceptor[] = [];
  removeResponseInterceptor(interceptor: IResponseInterceptor) {
    const idx = this._responseInterceptors.indexOf(interceptor);
    if (idx >= 0) this._responseInterceptors.splice(idx, 1);
  }
  addResponseInterceptor(interceptor: IResponseInterceptor) {
    this.removeResponseInterceptor(interceptor)
    this._responseInterceptors.push(interceptor)
    return () => this.removeResponseInterceptor(interceptor);
  }
  private _errorInterceptors: IErrorInterceptor[] = [];
  removeErrorInterceptor(interceptor: IErrorInterceptor) {
    const idx = this._errorInterceptors.indexOf(interceptor);
    if (idx >= 0) this._errorInterceptors.splice(idx, 1);
  }
  addErrorInterceptor(interceptor: IErrorInterceptor) {
    this.removeErrorInterceptor(interceptor)
    this._errorInterceptors.push(interceptor)
    return () => this.removeErrorInterceptor(interceptor);
  }
  async any<P extends TParams = TParams>(
    method: TAllMethods,
    _url: string,
    _params?: P | null | undefined,
    _o?: RequestInit | undefined
  ): Promise<Response> {

    let url = (() => {
      const query = _params ? qs.stringify(_params) : void 0;
      if (!query) return _url;
      const q_idx = _url.indexOf('?');
      const h_idx = _url.indexOf('#');
      if (h_idx >= 0 && q_idx >= 0) {
        return _url.substring(0, h_idx) + query + _url.substring(h_idx)
      } else if (h_idx >= 0) {
        return _url.substring(0, h_idx) + '?' + query + _url.substring(h_idx)
      } else {
        return _url + '?' + query
      }
    })()
    let opts: RequestInit = {
      method,
      mode: 'cors',
      ..._o,
    };
    for (const interceptor of this._requestInterceptors) {
      const req = await interceptor(url, opts);
      url = req[0]
      opts = req[1]
    }
    let resp = await fetch(url, opts)
    for (const interceptor of this._responseInterceptors) {
      resp = await interceptor(resp, url, opts);
    }
    if (resp.status >= 200 && resp.status <= 299)
      return resp

    let error = await KnownError.create_by_resp(url, resp)
    for (const interceptor of this._errorInterceptors) {
      const prev = error;
      error = KnownError.create_by_error(url, resp.status, await interceptor(error, resp, url, opts));
      if (KnownError.is(error))
        error.prev = prev
    }
    throw error
  }

  likeGet<P extends TParams = TParams>(
    method: TLikeGetMethods,
    url: string,
    params?: P | null,
    opts?: RequestInit
  ): Promise<Response> {
    return this.any(method, url, params, opts);
  }

  likePut<P extends TParams = TParams, B extends BodyInit = BodyInit>(
    method: TLikePutMethods,
    url: string,
    params?: P | null,
    body?: B | null,
    opts?: RequestInit
  ): Promise<Response> {
    return this.any(method, url, params, { ...opts, body: body });
  }

  get<P extends TParams = TParams>(url: string, params?: P | null, opts?: RequestInit): Promise<Response> {
    return this.likeGet('GET', url, params, opts);
  }

  post<P extends TParams = TParams, B extends BodyInit = BodyInit>(
    url: string,
    params?: P | null,
    body?: B | null,
    opts?: RequestInit
  ): Promise<Response> {
    return this.likePut('POST', url, params, body, opts);
  }
}

export const Http = new HTTP()