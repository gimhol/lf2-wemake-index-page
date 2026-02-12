
/* eslint-disable @typescript-eslint/no-explicit-any */
export interface InfoProp {
  key?: keyof Info;
  type: 'string';
  max?: number;
  placeholder?: 'string'
}
interface IInfo {
  id?: string;
  title?: string;
  short_title?: string;
  author?: string;
  author_url?: string;
  desc?: string;
  desc_url?: string;
  changelog?: string;
  changelog_url?: string;
  children_title?: string;
  children_url?: string;
  children?: IInfo[];
  i18n?: { [x in string]: IInfo }
}
export class Info implements IInfo {
  static readonly OPEN_IN_BROWSER = 'open_in_browser';
  static readonly PLAY_IN_BROWSER = 'play_in_browser';
  static readonly DOWNLOAD = 'download';
  static empty(parent: Info | null = null) {
    return new Info({}, '', parent, null)
  }
  readonly parent: Info | null = null;
  src: string | null;
  raw: any;
  set id(v: string | undefined) { this.set_str('id', v) }
  get id(): string | undefined { return this.get_str('id') }
  set_id(v: string) { this.id = v; return this; }
  set title(v: string | undefined) { this.set_str('title', v) }
  get title(): string | undefined { return this.get_str('title') }
  set_title(v: string) { this.title = v; return this; }
  set short_title(v: string | undefined) { this.set_str('short_title', v) }
  get short_title(): string | undefined { return this.get_str('short_title') }
  set_short_title(v: string) { this.short_title = v; return this; }
  set author(v: string | undefined) { this.set_str('author', v) }
  get author(): string | undefined { return this.get_str('author') }
  set_author(v: string) { this.author = v; return this; }
  set author_url(v: string | undefined) { this.set_str('author_url', v) }
  get author_url(): string | undefined { return this.get_str('author_url') }
  set_author_url(v: string) { this.author_url = v; return this; }
  set desc(v: string | undefined) { this.set_str('desc', v) }
  get desc(): string | undefined { return this.get_str('desc') }
  set_desc(v: string) { this.desc = v; return this; }
  set desc_url(v: string | undefined) { this.set_str('desc_url', v) }
  get desc_url(): string | undefined { return this.get_str('desc_url') }
  set_desc_url(v: string) { this.desc_url = v; return this; }
  set changelog(v: string | undefined) { this.set_str('changelog', v) }
  get changelog(): string | undefined { return this.get_str('changelog') }
  set_changelog(v: string) { this.changelog = v; return this; }
  set changelog_url(v: string | undefined) { this.set_str('changelog_url', v) }
  get changelog_url(): string | undefined { return this.get_str('changelog_url') }
  set_changelog_url(v: string) { this.changelog_url = v; return this; }
  set children_title(v: string | undefined) { this.set_str('children_title', v) }
  get children_title(): string | undefined { return this.get_str('children_title') }
  set_children_title(v: string) { this.children_title = v; return this; }
  set children_url(v: string | undefined) { this.set_str('children_url', v) }
  get children_url(): string | undefined { return this.get_str('children_url') }
  set_children_url(v: string) { this.children_url = v; return this; }
  set url(v: string | undefined) { this.set_str('url', v) }
  get url(): string | undefined { return this.get_str('url') }
  set_url(v: string) { this.url = v; return this; }
  set date(v: string | undefined) { this.set_str('date', v) }
  get date(): string | undefined { return this.get_str('date') }
  set_date(v: string) { this.date = v; return this; }
  set url_type(v: string | undefined) { this.set_str('url_type', v) }
  get url_type(): string | undefined { return this.get_str('url_type') }
  set_url_type(v: string) { this.url_type = v; return this; }
  set cover_url(v: string | undefined) { this.set_str('cover_url', v) }
  get cover_url(): string | undefined { return this.get_str('cover_url') }
  set_cover_url(v: string) { this.cover_url = v; return this; }
  set type(v: string | undefined) { this.set_str('type', v) }
  get type(): string | undefined { return this.get_str('type') }
  set_type(v: string) { this.type = v; return this; }
  set unavailable(v: string | undefined) { this.set_str('unavailable', v) }
  get unavailable(): string | undefined { return this.get_str('unavailable') }
  set_unavailable(v: string) { this.unavailable = v; return this; }

  lang: string;
  private _children?: Info[];

  constructor(raw: IInfo, lang: string, parent: Info | null, src: string | null) {
    this.src = src;
    this.parent = parent;
    this.lang = lang;
    this.raw = JSON.parse(JSON.stringify(raw));
    if (!this.raw.i18n) this.raw.i18n = {}
    if (!this.raw.i18n[lang]) this.raw.i18n[lang] = {}
    if (!this.raw.i18n['']) this.raw.i18n[''] = {}

    const children = this.raw.i18n[lang].children || this.raw.children;
    if (typeof children === 'string') {
      this.children_url = children
    } else if (Array.isArray(children)) {
      this._children = children
    }
  }
  get children() { return this._children; }
  set children(v: Info[] | undefined) { this._children = v; }

  private get_str(name: keyof this): string | undefined {
    const raw = this.raw.i18n[this.lang][name] || this.raw.i18n[''][name] || this.raw[name];
    if (raw === void 0 || raw === null) return void 0
    if (typeof raw === 'string') return raw;
    if (Array.isArray(raw)) return raw.join('\n')
    return '' + raw;
  }
  private set_str(name: keyof this, v: string | undefined) {
    this.raw.i18n[this.lang][name] = v;
  }
  with_lang(lang: string): Info {
    const ret = new Info(this.raw, lang, this.parent, this.src);
    ret.children = this.children?.map(v => v.with_lang(lang));
    return ret;
  }
  clone(): Info {
    const ret = new Info(this.raw, this.lang, this.parent, this.src);
    ret.children = this.children?.map(v => v.clone());
    return ret;
  }
  get_download_url(type: string) {
    if (typeof this.raw.downloads !== 'object') return void 0;
    return this.raw.downloads[type] || '';
  }
  async markdown() {
    const md = this.get_str('markdown')
    if (md) return md;

    let text = `# ${this.title}`
    text += '\n\n'
    text += `[中文](CHANGELOG.MD) | [English](CHANGELOG.EN.MD)`
    text += '\n\n'
    text += await this.fetch_desc().then(r => r ? `${r}\n\n` : '')
    text += await this.fetch_changelog().then(r => r ? `${r}\n\n` : '')

    if (this.children?.length) {
      text += `## ${this.children_title}\n\n`
      for (const version of this.children) {
        text += `### ${version.title}\n\n`
        if (version.date) text += `${version.date}\n\n`
        text += await version.fetch_desc().then(r => r ? `${r}\n\n` : '')
        text += await version.fetch_changelog().then(r => r ? `${r}\n\n` : '')
      }
    }
    return text;
  }

  async fetch_desc() {
    if (this.desc) return this.desc
    if (!this.desc_url) return '';
    return await fetch(this.desc_url, { mode: 'cors' })
      .then(r => r.text())
      .then(v => this.desc = v)
      .catch(e => '' + e)
  }
  async fetch_changelog() {
    if (this.changelog) return this.changelog
    if (!this.changelog_url) return '';
    return await fetch(this.changelog_url, { mode: 'cors' })
      .then(r => r.text())
      .then(v => this.changelog = v)
      .catch(e => '' + e)
  }
}

export const mod_info_props: Record<keyof Info, InfoProp | undefined> = {
  parent: undefined,
  raw: undefined,
  id: undefined,
  src: void 0,

  title: { type: 'string', },
  author: { type: 'string', },
  author_url: { type: 'string', },
  cover_url: { type: 'string', },
  url: { type: 'string', },
  unavailable: { type: 'string', },

  url_type: undefined,
  short_title: undefined,
  desc: undefined,
  desc_url: undefined,
  changelog: undefined,
  changelog_url: undefined,
  date: undefined,
  children_title: undefined,
  children_url: undefined,
  type: undefined,
  lang: undefined,
  children: undefined,
  with_lang: undefined,
  get_download_url: undefined,
  markdown: undefined,
  fetch_desc: undefined,
  fetch_changelog: undefined,
  set_desc: undefined,
  set_changelog: undefined,
  set_title: undefined,
  clone: undefined,
  set_author: undefined,
  set_author_url: undefined,
  set_id: undefined,
  set_desc_url: undefined,
  set_changelog_url: undefined,
  set_children_title: undefined,
  set_children_url: undefined,
  set_url: undefined,
  set_short_title: undefined,
  set_date: undefined,
  set_url_type: undefined,
  set_cover_url: undefined,
  set_type: undefined,
  set_unavailable: undefined
}