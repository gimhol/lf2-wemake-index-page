/* eslint-disable react-hooks/set-state-in-effect */
import { Info, type IInfo } from "@/base/Info";
import { CollapseButton } from "@/components/button/CollapseButton";
import { IconButton } from "@/components/button/IconButton";
import { Collapse } from "@/components/collapse/Collapse";
import { ImagesViewer } from "@/components/images/Viewer";
import { Loading } from "@/components/loading";
import { EditorView } from "@/components/markdown/editor/EditorView";
import { PickFile } from "@/components/pickfile";
import type { IPickedFile } from "@/components/pickfile/_Common";
import { Dropdown } from "@/gimd/Dropdown";
import Toast from "@/gimd/Toast";
import { ossUploadModRecords } from "@/hooks/ossUploadModRecords";
import { useOSS } from "@/hooks/useOSS";
import { useOSSUploadModImages } from "@/hooks/useOSSUploadModImages";
import { ApiHttp } from "@/network/ApiHttp";
import { interrupt_event } from "@/utils/interrupt_event";
import classnames from "classnames";
import dayjs from "dayjs";
import { useCallback, useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { useImmer } from "use-immer";
import { all_info_url_type, InfoUrlType } from "../yours/InfoUrlType";
import { ModPreview } from "../yours/ModPreviewModal";
import { get_mod, type IMod } from "../yours/get_mod";
import { replace_one } from "../yours/join_url";
import { save_mod } from "../yours/save_mod";
import csses from "./ModFormView.module.scss";
export interface IModFormViewProps {
  mod_id?: number;
}
const uploaded_map = new Map<File, IPickedFile>();
const langs = [{ value: '' as const, label: 'EN' }, { value: 'zh' as const, label: '中' }]
export function ModFormView(props: IModFormViewProps) {
  const { mod_id } = props;
  const { t } = useTranslation();
  const upload_images = useOSSUploadModImages({ mod_id })
  const [oss, sts] = useOSS()
  const [drafts, set_drafts] = useImmer<{ '': IInfo, 'zh': IInfo }>(() => ({ '': {}, zh: {} }))
  const [mod, set_mod] = useImmer<IMod | null>(null)
  const [loading, set_loading] = useState(!!mod_id);
  const [cover_uploading, set_cover_uploading] = useState(false);
  const [covers, set_covers] = useState<IPickedFile[]>()
  const [attachments, set_attachments] = useState<IPickedFile[]>()
  const [attachment_uploading, set_attachment_uploading] = useState(false);
  const small = !document.firstElementChild?.classList.contains('small-screen')
  const [opens, set_opens] = useImmer({ base: true, brief: small, desc: small, preview: false })
  const [lang, set_lang] = useState<'zh' | ''>('')
  const draft = drafts[lang];
  const type = mod?.record.type

  useEffect(() => {
    if (!mod_id || !sts) {
      set_loading(false)
      return;
    }
    set_loading(true);
    const ab = new AbortController();
    get_mod({ mod_id })
      .then(r => {
        if (ab.signal.aborted) return;
        set_mod(r)
        if (r.info.full_cover_url)
          set_covers([{ url: r.info.full_cover_url }])
        set_drafts({ '': r.info.raw, zh: r.info.raw.i18n?.['zh'] ?? {} })
      }).catch(e => {
        if (ab.signal.aborted) return;
        Toast.error(e)
      }).finally(() => {
        if (ab.signal.aborted) return;
        set_loading(false)
      })
    return () => ab.abort()
  }, [mod_id, oss, sts, set_mod, set_drafts])

  const tool_tips_container = () => document.getElementsByClassName(csses.mod_form_view).item(0)!

  const [previewing, set_previewing] = useImmer({ info: void 0 as undefined | Info })

  const preview = useCallback((open: boolean, l = lang) => {
    if (!mod) return;
    if (!open) {
      set_previewing({ info: void 0 })
    } else {
      const raw: IInfo = {
        ...drafts[''],
        i18n: { zh: { ...drafts.zh } }
      }
      set_previewing({
        info: mod
          .info
          .load(raw)
          .with_lang(l)
          .clone()
          .set_id('' + mod_id)
          .set_date(dayjs().format(`YYYY-MM-DD HH:mm:ss`))
      })
    }
    set_opens(d => { d.preview = open })
  }, [drafts, mod, lang, mod_id, set_opens, set_previewing])

  const save = async () => {
    if (!mod) return false;
    if (!mod_id) return false;
    if (!oss) return false;
    if (!mod.record.owner_id) return false;
    const raw: IInfo = {
      ...drafts[''],
      i18n: { zh: { ...drafts.zh } }
    }
    const next = mod.info.clone().load(raw).set_id('' + mod_id)
    if (JSON.stringify(mod.info.raw) === JSON.stringify(next.raw)) {
      Toast.show('Nothings Changed.')
      return false;
    }
    set_loading(true)
    next.set_date(dayjs().format(`YYYY-MM-DD HH:mm:ss`));
    return await save_mod({ mod_id, oss, info: next, owner_id: mod.record.owner_id })
      .then(() => {
        return get_mod({ mod_id })
      }).then(r => {
        if (r.info.full_cover_url)
          set_covers([{ url: r.info.full_cover_url }])
        set_drafts({ '': r.info.raw, zh: r.info.raw.i18n?.['zh'] ?? {} })
        set_mod(r)
        return true
      }).catch(e => {
        Toast.error(e)
        return false
      }).finally(() => {
        set_loading(false)
      })
  }
  const ref_main = useRef<HTMLDivElement>(null);
  const ref_animating = useRef(false)
  const ref_scroll_top = useRef(0)
  const on_scroll = () => {
    const el = ref_main.current;
    if (!el || opens.preview || ref_animating.current) return;
    ref_scroll_top.current = el.scrollTop;
  }
  useEffect(() => {
    const el = ref_main.current;
    if (!el) return;
    ref_animating.current = true
    const tid = setTimeout(() => {
      if (opens.preview) {
        const t = document.getElementById('preview_head')!.offsetTop
        el.scrollTo({ top: t, behavior: 'smooth' })
      } else {
        el.scrollTo({ top: ref_scroll_top.current, behavior: 'smooth' })
      }
      ref_animating.current = false
    }, 300)
    return () => clearTimeout(tid)
  }, [opens.preview])

  const unpublish = async () => {
    if (!mod) return;
    set_loading(true)
    ApiHttp.post(`${API_BASE}lfwm/unpublish`, {}, { id: mod.record.id }).then((r) => {
      Toast.show('' + r.msg)
    }).catch(e => {
      Toast.error(e)
    }).finally(() => {
      set_loading(false)
    })
  }

  const publish = async () => {
    if (!mod) return;
    set_loading(true)
    save().then(() => {
      return ApiHttp.post(`${API_BASE}lfwm/publish`, {}, { id: mod.record.id })
    }).then((r) => {
      Toast.show('' + r.msg)
    }).catch(e => {
      Toast.error(e)
    }).finally(() => {
      set_loading(false)
    })
  }

  if (!mod && !loading) return <></>
  return <>
    <div className={classnames(csses.mod_form_view, loading ? csses.loading : void 0)}>
      <div className={csses.head}>
        <h1 className={csses.title}>
          {t('edit_%1_info').replace('%1', t(`d_${type}`))}
          <Dropdown.Select options={langs}
            value={lang}
            onChange={v => {
              preview(opens.preview, v ?? '')
              set_lang(v ?? '')
            }} />
          <Dropdown.Select options={[{ value: 'cards' }, { value: 'list' }]}
            value={drafts[''].children_look ?? 'list'}
            onChange={v => set_drafts(d => { d[''].children_look = v })} />
        </h1>
      </div>
      <div className={classnames(csses.main, csses.scrollview)} ref={ref_main} onScroll={on_scroll}>
        <CollapseButton
          className={csses.title_button}
          open={opens.base && !opens.preview}
          onClick={() => set_opens(d => { if (d.preview) d.preview = false; else d.base = !d.base; })} >
          <h2 className={csses.title}>
            {t("mod_base_info")}
          </h2>
        </CollapseButton>
        <Collapse open={opens.base && !opens.preview} classNames={{ inner: csses.base_info }}>
          <div className={csses.form_row}>
            <span>{t('data_zip_title')}:</span>
            <div className={csses.short_and_long}>
              <input
                className={csses.short}
                value={draft.short_title}
                onChange={e => { interrupt_event(e); set_drafts(d => { d[lang].short_title = e.target.value }) }}
                type="text"
                placeholder={t("short_title")}
                maxLength={50} />
              <input
                className={csses.long}
                value={draft.title}
                onChange={e => { interrupt_event(e); set_drafts(d => { d[lang].title = e.target.value }) }}
                type="text"
                placeholder={t("full_title")}
                maxLength={255} />
            </div>
          </div>
          <div className={csses.form_row}>
            <span>{t('author')}:</span>
            <div className={csses.short_and_long}>
              <input
                className={csses.short}
                value={draft.author}
                onChange={e => { interrupt_event(e); set_drafts(d => { d[lang].author = e.target.value }) }}
                type="text"
                placeholder={t("author")}
                maxLength={50} />
              <input
                className={csses.long}
                value={draft.author_url}
                type="text"
                onChange={e => { interrupt_event(e); set_drafts(d => { d[lang].author_url = e.target.value }) }}
                placeholder={t("author_url")}
                maxLength={255} />
            </div>
          </div>
          <div className={csses.form_row}>
            <span>{t('link')}:</span>
            <div className={csses.short_and_long}>
              <Dropdown.Select
                value={drafts[''].url_type}
                onChange={v => set_drafts(d => { d[''].url_type = v })}
                options={all_info_url_type.map(v => ({ value: v, label: t(v) }))} />
              {drafts[''].url_type === InfoUrlType.Download ?
                <PickFile
                  max={1}
                  accept=".zip"
                  value={attachments}
                  whenChange={records => {
                    set_attachments(records)
                    if (!records?.length) return;
                    set_attachment_uploading(true);
                    ossUploadModRecords({
                      mod_id, files: records.map(v => v.file!).filter(Boolean), oss, sts, limits: {
                        'application/x-zip-compressed': { max_size: 100 * 1024 * 1024 },
                        'application/zip': { max_size: 100 * 1024 * 1024 },
                      },
                      progress: (progress, { file }) => {
                        const record = uploaded_map.get(file);
                        if (!record) uploaded_map.set(file, { file, url: "", progress, name: file.name });
                        else uploaded_map.set(file, { ...record, progress })
                        set_attachments(prev => replace_one(prev, v => {
                          return v.file == file ? { ...v, progress } : null
                        }))
                      }
                    }).then(r => {
                      if (!r.length) throw 'upload nothings'
                      const name = r[0].url.split('/').pop();
                      set_drafts(d => {
                        d[lang].url = name;
                        d[lang].url_type = 'download'
                      })
                    }).catch((err) => {
                      Toast.error(err)
                    }).finally(() => {
                      set_attachment_uploading(false);
                    })
                  }}>
                  <PickFile.Files />
                </PickFile> :
                <input
                  className={csses.long}
                  value={drafts[''].url}
                  type="text"
                  onChange={e => {
                    interrupt_event(e);
                    set_drafts(d => { d[''].url = e.target.value.trim() })
                  }}
                  placeholder={`https://....`}
                  maxLength={255} />
              }
            </div>
          </div>
          <div className={csses.form_row}>
            <span>{t('cover_img')}:</span>
            <PickFile
              max={1}
              accept=".png,.jpg,.webp"
              value={covers}
              whenChange={records => {
                set_covers(records)
                if (!records?.length) {
                  set_drafts(d => { d[lang].cover_url = void 0 })
                  return;
                }
                set_cover_uploading(true);
                ossUploadModRecords({
                  mod_id, files: records.map(v => v.file!).filter(Boolean), oss, sts, limits: {
                    'image/png': { max_size: 5 * 1024 * 1024 },
                    'image/jpeg': { max_size: 5 * 1024 * 1024 },
                    'image/webp': { max_size: 5 * 1024 * 1024 },
                  },
                  progress: (progress, { file }) => {
                    set_covers(prev => replace_one(prev, v => {
                      return v.file == file ? { ...v, progress } : null
                    }))
                  }
                }).then(r => {
                  if (!r.length) throw 'upload nothings'
                  set_drafts(d => { d[lang].cover_url = r[0].url })
                }).catch((err) => {
                  Toast.error(err)
                }).finally(() => {
                  set_cover_uploading(false);
                })
              }}>
              <PickFile.Images onFileClick={(_, r, { files }) => {
                ImagesViewer.open(files, files?.findIndex(v => v.url === r.url))
              }} />
            </PickFile>
          </div>

        </Collapse>
        <CollapseButton
          className={csses.title_button}
          open={opens.brief && !opens.preview}
          onClick={() => set_opens(d => { if (d.preview) d.preview = false; else d.brief = !d.brief })} >
          <h2 className={csses.title}>
            {t("mod_brief")}
          </h2>
        </CollapseButton>
        <Collapse open={opens.brief && !opens.preview} classNames={{ inner: csses.collapse_inner }}>
          <div className={csses.brief_editor}>
            <EditorView
              value={draft.brief}
              onChange={v => set_drafts(d => { d[lang].brief = v })}
              placeholder={t("edit_brief_here")} />
          </div>
        </Collapse>
        <CollapseButton
          className={csses.title_button}
          open={!opens.preview && opens.desc}
          onClick={() => set_opens(d => { if (d.preview) d.preview = false; else d.desc = !d.desc })} >
          <h2 className={csses.title}>
            {t("mod_description")}
          </h2>
        </CollapseButton>
        <Collapse open={!opens.preview && opens.desc} classNames={{ inner: csses.collapse_inner }}>
          <div className={csses.md_editor}>
            <EditorView
              uploadImages={upload_images}
              value={draft.desc}
              onChange={v => set_drafts(d => { d[lang].desc = v })}
              placeholder={t("edit_description_here")} />
          </div>
        </Collapse>
        <CollapseButton
          id="preview_head"
          className={csses.title_button}
          open={opens.preview}
          onClick={() => preview(!opens.preview)} >
          <h2 className={csses.title} >
            {t("preview")}
          </h2>
        </CollapseButton>
        <Collapse open={opens.preview} classNames={{ inner: csses.collapse_inner }}>
          <ModPreview info={previewing.info} />
        </Collapse>
        <div style={{ height: '100vh' }} />
      </div>
      <div className={csses.foot}>
        <div style={{ flex: 1 }} />
        <IconButton
          style={{ fontSize: '1.5rem' }}
          container={tool_tips_container}
          disabled={loading || cover_uploading || attachment_uploading}
          onClick={() => preview(!opens.preview)}>
          {t('preview')}
        </IconButton>
        <IconButton
          style={{ fontSize: '1.5rem' }}
          container={tool_tips_container}
          disabled={loading || cover_uploading || attachment_uploading}
          onClick={save}>
          {t('save')}
        </IconButton>
        <IconButton
          style={{ fontSize: '1.5rem' }}
          container={tool_tips_container}
          disabled={loading || cover_uploading || attachment_uploading}
          onClick={async () => {
            await unpublish()
          }}>
          {t('unpublish')}
        </IconButton>
        <IconButton
          style={{ fontSize: '1.5rem' }}
          container={tool_tips_container}
          disabled={loading || cover_uploading || attachment_uploading}
          onClick={async () => {
            await save()
            await publish()
          }}>
          {t('publish')}
        </IconButton>

      </div>
      <Loading big absolute center loading={loading} />
    </div>
  </>
}


