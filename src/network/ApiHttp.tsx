/* eslint-disable @typescript-eslint/no-unnecessary-type-constraint */
/* eslint-disable @typescript-eslint/no-explicit-any */
import type { TLikeGetMethods, TLikePutMethods, TParams } from './Http';
import { HTTP } from './Http';

export interface IApiReply<D = void> {
  code?: number;
  msg?: string;
  data?: D;
  total?: number;
  httpStatus?: number;
}

export class APIHTTP {
  readonly http = new HTTP()

  readonly addRequestInterceptor = this.http.addRequestInterceptor.bind(this.http)
  readonly removeRequestInterceptor = this.http.removeRequestInterceptor.bind(this.http)

  readonly addResponseInterceptor = this.http.addResponseInterceptor.bind(this.http)
  readonly removeResponseInterceptor = this.http.removeResponseInterceptor.bind(this.http)

  readonly addErrorInterceptor = this.http.addErrorInterceptor.bind(this.http)
  readonly removeErrorInterceptor = this.http.removeErrorInterceptor.bind(this.http)

  readonly ignoreAbort = this.http.ignoreAbort.bind(this.http)
  readonly ignore401 = async (e: any) => e?.cause?.httpStatus !== 401 ? Promise.reject(e) : void 0

  async likeGet<P extends TParams = TParams, R extends any = any>(
    method: TLikeGetMethods,
    url: string,
    params?: P | null,
    opts?: RequestInit
  ): Promise<IApiReply<R>> {
    const it = await this.http.likeGet(method, url, params, opts);
    return await it.json();
  }

  async likePut<P extends TParams = TParams, B extends any = any, R extends any = any>(
    method: TLikePutMethods,
    url: string,
    params?: P | null,
    body?: B | null,
    opts?: RequestInit
  ): Promise<IApiReply<R>> {
    const _body = body ? JSON.stringify(body) : void 0
    const it = await this.http.likePut(method, url, params, _body, opts);
    return await it.json();
  }

  get<P extends TParams = TParams, R extends any = any>(
    url: string,
    params?: P | null,
    opts?: RequestInit
  ): Promise<IApiReply<R>> {
    return this.likeGet('GET', url, params, opts)
  }

  delete<P extends TParams = TParams, R extends any = any>(
    url: string,
    params?: P | null,
    opts?: RequestInit
  ): Promise<IApiReply<R>> {
    return this.likeGet('DELETE', url, params, opts)
  }
  post<P extends TParams = TParams, B extends any = any, R extends any = any>(
    url: string,
    params?: P | null,
    body?: B | null,
    opts?: RequestInit
  ): Promise<IApiReply<R>> {
    return this.likePut('POST', url, params, body, opts);
  }

}


export const ApiHttp = new APIHTTP()
