/* eslint-disable @typescript-eslint/no-explicit-any */
import type { IRecord } from "@/api/listModRecords";
import { Info } from "@/base/Info";
import { ApiHttp } from "@/network/ApiHttp";
import { fetch_info } from "./fetch_info";

export async function fetch_info_list(url: string, parent: Info | null, lang: string, init: RequestInit & { histories?: Map<string, Info>; } = {}) {
  const { signal, histories = new Map<string, Info>() } = init;
  const resp = await fetch(url, init);
  const raw_list = await resp.json();
  if (!Array.isArray(raw_list)) throw new Error(`[fetch_info_list] failed, got ${raw_list}`);
  if (signal?.aborted) return;
  const cooked_list: Info[] = [];
  for (const raw_item of raw_list) {
    if (!raw_item) continue;
    if (typeof raw_item === 'object') {
      cooked_list.push(new Info(raw_item, lang, parent, null));
      continue;
    }
    if (typeof raw_item === 'string') {
      const history_key = `[${lang}]${raw_item}`;
      const history = histories.get(history_key) || await fetch_info(raw_item, parent, lang, { signal });
      cooked_list.push(history);
    }
  }
  return cooked_list;
}

export interface IRecordInfo extends IRecord {
  info: Info;
}
export async function fetch_infos(lang: string, init: RequestInit = {}): Promise<IRecordInfo[] | undefined> {
  const { signal } = init;
  const reply = await ApiHttp.post<any, any, IRecord[]>(`${API_BASE}lfwm/list`, null, {
    parent: 0, status: ['published'], type: ['product'],
  }, init)

  if (init.signal?.aborted) return;
  const raw_list = reply.data;
  if (!Array.isArray(raw_list))
    throw new Error(`[fetch_infos] failed, got ${raw_list}`);
  const cooked_list: IRecordInfo[] = [];
  for (const raw_item of raw_list) {
    if (!raw_item) continue;
    const { url } = raw_item;
    if (typeof url !== 'string') continue;
    const info = await fetch_info(url, null, lang, { signal })
    const cooked_item: IRecordInfo = { ...raw_item, info }
    cooked_list.push(cooked_item);
  }
  return cooked_list;
}
export async function fetch_children(parent: number | string, lang: string, init: RequestInit = {}): Promise<IRecordInfo[] | undefined> {
  const { signal } = init;
  const r = await ApiHttp.get<any, IRecord[]>(`${API_BASE}lfwm/list`, { parent }, init)
  if (init.signal?.aborted) return;
  const raw_list = r.data;
  if (!Array.isArray(raw_list))
    throw new Error(`[fetch_infos] failed, got ${raw_list}`);
  const cooked_list: IRecordInfo[] = [];
  for (const raw_item of raw_list) {
    if (!raw_item) continue;
    const { url } = raw_item;
    if (typeof url !== 'string') continue;
    const info = await fetch_info(url, null, lang, { signal })
    const cooked_item: IRecordInfo = { ...raw_item, info }
    cooked_list.push(cooked_item);
  }
  return cooked_list;
}
