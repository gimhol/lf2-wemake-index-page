/* eslint-disable no-constant-condition */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { join_url } from "@/pages/yours/join_url";
import {
  makeI18N,
  type TSetStr
} from "./MakeUstr";
export interface InfoProp {
  key?: keyof Info;
  type: 'string';
  max?: number;
  placeholder?: 'string'
}
export type TInfoChildrenLook = "cards" | "list"
export interface IInfo {
  id?: string;
  title?: string;
  short_title?: string;
  type?: RecordType;
  brief?: string;
  author?: string;
  author_url?: string;
  url?: string;
  url_name?: string;
  url_type?: string;

  desc?: string;
  desc_url?: string;
  children_title?: string;
  children_url?: string;
  children_look?: string;
  children?: IInfo[];
  date?: string;
  cover_url?: string;
  unavailable?: string;
  more_urls?: [{ url_type: string, url: string, url_name: string }];
  i18n?: { [x in string]: IInfo };
}

const { Cls, Str } = makeI18N();
@Cls export class Info implements IInfo {
  static readonly OPEN_IN_BROWSER = 'open_in_browser';
  static readonly PLAY_IN_BROWSER = 'play_in_browser';
  static readonly DOWNLOAD = 'download';

  static empty(parent: Info | null = null) {
    return new Info({}, '', parent, null)
  }
  readonly parent: Info | null = null;
  src: string | null;
  raw!: IInfo;
  set id(v: string | undefined) { this.raw.id = v }
  get id(): string | undefined { return this.raw.id }
  set_id(v: string | undefined) { this.id = v; return this; }
  set type(v: RecordType | undefined) { this.raw.type = v }
  get type(): RecordType | undefined { return this.raw.type }
  set_type(v: RecordType | undefined) { this.type = v; return this; }

  get raw_desc(): string | undefined { return this.raw.desc; }
  get all_desc(): Map<string, string> {
    const ret = new Map<string, string>();
    if (this.raw.desc?.trim())
      ret.set('', this.raw.desc.trim());
    const subs = this.raw.i18n
    if (subs) for (const key in subs) {
      const desc = subs[key].desc?.trim();
      if (desc) ret.set(key, desc);
    }
    return ret;
  }

  @Str title            !: string | undefined; set_title          !: TSetStr<this>
  @Str short_title      !: string | undefined; set_short_title    !: TSetStr<this>
  @Str author           !: string | undefined; set_author         !: TSetStr<this>
  @Str author_url       !: string | undefined; set_author_url     !: TSetStr<this>
  @Str brief            !: string | undefined; set_brief          !: TSetStr<this>
  @Str desc             !: string | undefined; set_desc           !: TSetStr<this>
  @Str desc_url         !: string | undefined; set_desc_url       !: TSetStr<this>
  // @Str changelog        !: string | undefined; set_changelog      !: TSetStr<this>
  // @Str changelog_url    !: string | undefined; set_changelog_url  !: TSetStr<this>
  @Str children_title   !: string | undefined; set_children_title !: TSetStr<this>
  @Str children_url     !: string | undefined; set_children_url   !: TSetStr<this>
  @Str url              !: string | undefined; set_url            !: TSetStr<this>
  @Str url_type         !: string | undefined; set_url_type       !: TSetStr<this>
  @Str date             !: string | undefined; set_date           !: TSetStr<this>
  @Str cover_url        !: string | undefined; set_cover_url      !: TSetStr<this>
  @Str unavailable      !: string | undefined; set_unavailable    !: TSetStr<this>
  @Str children_look    !: string | undefined; set_children_look  !: TSetStr<this>

  lang: string;
  private _md?: string;
  private _bros: { [x in string]?: Info } = {}
  private _subs: Info[] = [];
  get children() { return this._subs; }
  set children(v: Info[]) { this._subs = v; }

  get full_cover_url() {
    const { cover_url } = this
    if (!cover_url) return cover_url
    return this.full_url(cover_url)
  }
  constructor(raw: IInfo, lang: string, parent: Info | null, src: string | null) {
    this.src = src;
    this.parent = parent;
    this.lang = lang;
    this.load(raw)
  }

  load(raw: IInfo): this {
    this.raw = JSON.parse(JSON.stringify(raw));
    const alias_paths = new Set<string>()
    const bros = this.raw.i18n;
    const bro_keys = this.raw.i18n && Object.keys(this.raw.i18n)
    if (bros && bro_keys?.length) {
      for (const bro_key of bro_keys) {
        let bro: any = bros[bro_key]
        if (typeof bro === 'string') {
          if (alias_paths.has(bro))
            throw new Error('i18n bad loop!')
          bro = bros[bro]
          alias_paths.add(bro)
        }
        if (!bro || !Object.keys(bro).length) {
          delete bros[bro_key]
          continue;
        }
        this._bros[bro_key] = new Info(bro, bro_key, this.parent, this.src)
      }
    } else {
      delete this.raw.i18n
    }
    const { children } = this.raw
    if (Array.isArray(children))
      this._subs = children.map(c => new Info(c, this.lang, this, this.src))

    if (this._bros['']) {
      Object.assign(this.raw, this._bros[''].raw);
      delete this.raw.i18n?.[''];
      delete this._bros[''];
    }
    return this;
  }
  get_str<K extends keyof IInfo>(key: K): string | undefined {
    const value =
      this._bros[this.lang]?.get_str(key) ||
      this.raw[key];
    if (value === void 0 || value === null) return void 0
    if (Array.isArray(value)) return value.join('\n')
    return '' + value;
  }
  set_str<K extends keyof IInfo, V extends IInfo[K]>(key: K, v: V) {
    return this.raw[key] = v;
  }
  with_lang(lang: string): Info {
    const ret = new Info(this.raw, lang, this.parent, this.src);
    return ret;
  }
  clone(): Info {
    const ret = new Info(this.raw, this.lang, this.parent, this.src);
    ret.children = this.children.map(v => v.clone());
    return ret;
  }
  get_url_by_name(name: string) {
    if (!Array.isArray(this.raw.more_urls)) return void 0;
    return this.raw.more_urls.find(v => v.url_name == name)?.url || '';
  }
  async markdown() {
    const md = this._md
    if (md) return md;

    let text = `# ${this.title}`
    text += '\n\n'
    if (this.author && this.author_url) {
      text += `visit [**${this.author}**](${this.author_url})\n\n`
    } else if (this.author) {
      text += `by **${this.author}**\n\n`
    } else if (this.author_url) {
      text += `visit [author](${this.author_url})\n\n`
    }
    // text += `[中文](CHANGELOG.MD) | [English](CHANGELOG.EN.MD)\n\n`

    if (this.full_cover_url) text += `[!cover](${this.full_cover_url})\n\n`

    if (this.brief) text += `${this.brief}\n\n`
    text += await this.fetch_desc().then(r => r ? `${r}\n\n` : '')
    // text += await this.fetch_changelog().then(r => r ? `${r}\n\n` : '')

    if (this.children?.length) {
      text += `## ${this.children_title}\n\n`
      for (const version of this.children) {
        text += `### ${version.title}\n\n`
        if (version.date) text += `${version.date}\n\n`
        text += await version.fetch_desc().then(r => r ? `${r}\n\n` : '')
        // text += await version.fetch_changelog().then(r => r ? `${r}\n\n` : '')
      }
    }
    return text;
  }
  async fetch_desc() {
    if (this.desc) return this.desc;
    return await this.load_desc()
  }
  get full_desc_url() {
    const { desc_url } = this;
    if (!desc_url) return desc_url
    return this.full_url(desc_url)
  }
  private full_url(url: string) {
    const _url: string = url.trim();
    if (_url.startsWith('http://') || _url.startsWith('https://'))
      return url
    if (this.src?.startsWith(STORAGE_URL_BASE) && STORAGE_URL_BASE)
      return join_url(STORAGE_URL_BASE, _url)
    return url
  }
  async load_desc() {
    do {
      const { desc_url } = this.raw
      if (desc_url) this.raw.desc = await this.fetch(desc_url).then(r => r.text());
      if (!this.raw.i18n) break;
      for (const key in this.raw.i18n) {
        const { desc_url } = this.raw.i18n[key] ?? {}
        if (!desc_url) continue;
        this.raw.i18n[key].desc = await this.fetch(desc_url).then(r => r.text());
      }
    } while (false);
    return this.desc;
  }
  private async fetch(url: string): Promise<Response> {
    return fetch(this.full_url(url), { mode: 'cors' })
  }
}