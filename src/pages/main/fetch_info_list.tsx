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

export async function fetch_infos(lang: string, init: RequestInit = {}): Promise<Info[] | undefined> {
  const { signal } = init;
  const r = await ApiHttp.post(`${API_BASE}lfwm/list`, null, {
    parent: 0, status: ['published'], type: ['product'],
  }, init)
  if (init.signal?.aborted) return;
  const raw_list = r.data;
  if (!Array.isArray(raw_list))
    throw new Error(`[fetch_infos] failed, got ${raw_list}`);
  const cooked_list: Info[] = [];
  for (const raw_item of raw_list) {
    if (!raw_item) continue;
    if (typeof raw_item === 'object') {
      cooked_list.push(new Info(raw_item, lang, null, null));
      continue;
    }
    if (typeof raw_item === 'string') {
      const item = await fetch_info(raw_item, null, lang, { signal })
      cooked_list.push(item);
    }
  }
  return cooked_list;
}
export async function fetch_children(parent: number | string, lang: string, init: RequestInit = {}): Promise<Info[] | undefined> {
  const { signal } = init;
  const r = await ApiHttp.get(`${API_BASE}lfwm/list`, { parent }, init)
  if (init.signal?.aborted) return;
  const raw_list = r.data;
  if (!Array.isArray(raw_list))
    throw new Error(`[fetch_infos] failed, got ${raw_list}`);
  const cooked_list: Info[] = [];
  for (const raw_item of raw_list) {
    if (!raw_item) continue;
    if (typeof raw_item === 'object') {
      cooked_list.push(new Info(raw_item, lang, null, null));
      continue;
    }
    if (typeof raw_item === 'string') {
      const item = await fetch_info(raw_item, null, lang, { signal })
      cooked_list.push(item);
    }
  }
  return cooked_list;
}
