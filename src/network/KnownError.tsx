/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import type { IApiReply } from './ApiHttp';

export interface IHttpError extends Error {
  prev?: IHttpError;
  readonly is_http_error?: true;
  readonly url: string;
  readonly body?: string;
  readonly http_status: number;
  readonly reply: IApiReply<unknown>;
}
export function is(v: unknown): v is IHttpError {
  return (v as any)?.is_http_error === true;
}
export async function create_by_resp(url: string, resp: Response): Promise<IHttpError> {
  const body = await resp.text().catch(() => void 0);
  const error = new Error(
    `[${resp.status}] ${resp.statusText}`
  );
  const reply: IApiReply<unknown> = { msg: '' + error };
  try {
    Object.assign(reply, JSON.parse(body!));
    error.cause = reply.msg;
  } catch (e: any) { /* empty */ }
  return Object.assign(
    error,
    {
      url, body,
      is_http_error: true as const,
      http_status: resp.status,
      reply
    }
  );
}
export function create_by_error(url: string, httpStatus: number, error: Error): IHttpError {
  if (is(error))
    return error;
  return Object.assign(
    error, {
    url,
    is_http_error: true as const,
    http_status: httpStatus,
    reply: { msg: '' + error, httpStatus }
  });
}