/**
 * 统一读取 OSS 公开对象的轻量 HTTP 封装。
 * 与 ApiHttp（自家 API）互补：这里只负责「拼好的完整 URL → fetch → text/json」，
 * 统一 mode: 'cors' 与非 2xx 错误归一化。
 */
export const storageHttp = {
  async fetch(url: string, opts: RequestInit = {}): Promise<Response> {
    const r = await fetch(url, { mode: 'cors', ...opts });
    if (!r.ok) throw new Error(`[${r.status}]${r.statusText}`);
    return r;
  },
  async text(url: string, opts: RequestInit = {}): Promise<string> {
    return (await storageHttp.fetch(url, opts)).text();
  },
  async json<T = unknown>(url: string, opts: RequestInit = {}): Promise<T> {
    return (await storageHttp.fetch(url, opts)).json();
  },
};
