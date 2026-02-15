/* eslint-disable react-hooks/set-state-in-effect */
import type { IInfo } from "@/base/Info";
import { CollapseButton } from "@/components/button/CollapseButton";
import { IconButton } from "@/components/button/IconButton";
import { Collapse } from "@/components/collapse/Collapse";
import { ImagesViewer } from "@/components/images/Viewer";
import { Loading } from "@/components/loading";
import { EditorView } from "@/components/markdown/editor/EditorView";
import { PickFile } from "@/components/pickfile";
import type { IPickedFile } from "@/components/pickfile/_Common";
import Toast from "@/gimd/Toast";
import { ossUploadModFiles, type IUploadFileResult } from "@/hooks/ossUploadModFiles";
import { useOSS } from "@/hooks/useOSS";
import { useOSSUploadModImages } from "@/hooks/useOSSUploadModImages";
import { file_size_txt } from "@/utils/file_size_txt";
import { interrupt_event } from "@/utils/interrupt_event";
import classnames from "classnames";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useImmer } from "use-immer";
import csses from "./ModFormView.module.scss";
import { get_mod, type IMod } from "./get_mod";
import { replace_one } from "./join_url";
export interface IModFormViewProps {
  mod_id?: number;
}


export function ModFormView(props: IModFormViewProps) {
  const { mod_id } = props;
  const { t } = useTranslation();
  const [toast, toast_ctx] = Toast.useToast()
  const upload_images = useOSSUploadModImages({ mod_id, toast })
  const [oss, sts] = useOSS()
  const [data_progress, set_data_progress] = useState<[number, number]>()
  const [, set_data_upload_result] = useState<IUploadFileResult[]>([])
  const [draft, set_draft] = useImmer<IInfo>({})
  const [mod, set_mod] = useImmer<IMod | null>(null)
  const [loading, set_loading] = useState(!!mod_id);
  const [cover_uploading, set_cover_uploading] = useState(false);
  const [covers, set_covers] = useState<IPickedFile[]>()
  const [opens, set_opens] = useImmer({
    base: true,
    brief: true,
    desc: true,
    changelog: true,
  })
  useEffect(() => {
    if (!mod_id || !sts) {
      set_loading(false)
      return;
    }
    set_loading(true);
    const ab = new AbortController();
    get_mod({ mod_id, oss, sts })
      .then(r => {
        if (ab.signal.aborted) return;
        set_draft(r.info.raw)
        set_mod(r)
        if (r.full_cover_url) set_covers([{ url: r.full_cover_url }])
      }).catch(e => {
        if (ab.signal.aborted) return;
        toast(e)
      }).finally(() => {
        if (ab.signal.aborted) return;
        set_loading(false)
      })
    return () => ab.abort()
  }, [mod_id, toast, oss, sts, set_mod, set_draft])

  const tool_tips_container = () => document.getElementsByClassName(csses.mod_form_view).item(0)!
  const save = () => {
    if (!mod) return;
    if (!oss || !sts || !mod.strings || !mod_id) return;
    set_loading(true)
    const available = data_progress?.[0] == 1;
    const next = mod.info.load(draft).clone()
      .set_id('' + mod_id)
      .set_url(available ? mod.strings.data_obj_name : void 0)
      .set_unavailable(available ? void 0 : 'unpublish')
    const json_blob = new Blob([JSON.stringify(next.raw)], { type: 'application/json; charset=utf-8' })
    oss.put(mod.strings.info_obj_path, json_blob).then(() => {
      console.log(sts.base + mod.strings.info_obj_path)
      return oss.head(mod.strings.info_obj_path)
    }).then(r => {
      return r
    }).then(r => {
      alert(r)
    }).catch(e => {
      toast.error(e)
    }).finally(() => {
      set_loading(false)
    })
  }
  return (
    <div className={classnames(csses.mod_form_view, loading ? csses.loading : void 0)}>
      {toast_ctx}
      <div className={csses.head}>
        <h1 className={csses.title}>
          {t('edit_mod_info')}
        </h1>
      </div>
      <div className={classnames(csses.main, csses.scrollview)}>
        <h2 className={csses.title}>
          <CollapseButton open={opens.base} onClick={() => set_opens(d => { d.base = !d.base })} />
          {t("mod_base_info")}
        </h2>
        <Collapse open={opens.base} classNames={{ inner: csses.base_info }}>
          <div className={csses.form_row}>
            <span>{t('data_zip_title')}:</span>
            <input
              className={csses.txt_input}
              value={draft.title}
              onChange={e => {
                interrupt_event(e)
                set_draft(d => { d.title = e.target.value })
              }}
              type="text"
              placeholder={t("edit_title_here")}
              maxLength={50} />
          </div>
          <div className={csses.form_row}>
            <span>{t('author')}:</span>
            <input
              className={csses.txt_input}
              value={draft.author}
              onChange={e => {
                interrupt_event(e)
                set_draft(d => { d.author = e.target.value })
              }}
              type="text"
              placeholder={t("edit_author_here")}
              maxLength={50} />
          </div>
          <div className={csses.form_row}>
            <span>{t('author_url')}:</span>
            <input
              className={csses.txt_input}
              value={draft.author_url}
              type="text"
              onChange={e => {
                interrupt_event(e)
                set_draft(d => { d.author_url = e.target.value })
              }}
              placeholder={t("edit_author_url_here")}
              maxLength={255} />
          </div>
          <div className={csses.form_row}>
            <span>{t('cover_img')}:</span>
            <PickFile
              max={1}
              accept=".png;.jpg;.webp"
              value={covers}
              whenChange={records => {
                set_covers(records)
                if (!records?.length) return;
                set_cover_uploading(true);
                ossUploadModFiles({
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
                  const name = r[0].url.split('/').pop();
                  set_draft(d => { d.cover_url = name })
                }).catch((err) => {
                  toast.error(err)
                }).finally(() => {
                  set_cover_uploading(false);
                })
              }}>
              <PickFile.Images onFileClick={(_, r, { files }) => {
                if (!files?.length) return;
                const imgs = files.map(v => ({ url: v.url, alt: v.name }))
                ImagesViewer.open(imgs, files.findIndex(v => v.url === r.url))
              }} />
            </PickFile>
          </div>
          <div className={csses.form_row}>
            <span>{t('data_zip')}:</span>
            <input
              className={csses.file_input}
              type="file"
              accept=".zip"
              onDragOver={e => { e.stopPropagation() }}
              onDrop={e => { e.stopPropagation() }}
              onChange={e => {
                if (!e.target.files?.length) return;
                const files = Array.from(e.target.files)
                ossUploadModFiles({
                  mod_id, files, oss, sts, limits: {
                    'application/x-zip-compressed': { max_size: 100 * 1024 * 1024 },
                    'application/zip': { max_size: 100 * 1024 * 1024 },
                  },
                  getObjectName: async () => {
                    if (!mod?.strings.data_obj_path) throw new Error('not ready!')
                    return mod.strings.data_obj_path
                  },
                  progress: (progress, info) => {
                    set_data_progress(prev => {
                      const file_size = info?.fileSize ?? prev?.[1] ?? 0
                      return [progress, file_size]
                    })
                  }
                }).then((r) => {
                  set_data_upload_result(r)
                }).catch((err) => {
                  toast.error(err)
                  e.target.files = null;
                })
              }}
            />
          </div>
          <div style={{ display: 'flex' }}>
            {
              data_progress ?
                <div className={csses.upload_result}>
                  <div>progress: {(100 * data_progress[0]).toFixed(2)}%</div>
                  <div>size: {file_size_txt(data_progress[1])}</div>
                </div> : null
            }
          </div>
        </Collapse>
        <h2 className={csses.title}>
          <CollapseButton open={opens.brief} onClick={() => set_opens(d => { d.brief = !d.brief })} />
          {t("mod_brief")}
        </h2>
        <Collapse open={opens.brief} classNames={{ inner: csses.collapse_inner }}>
          <div className={csses.md_editor}>
            <EditorView
              uploadImages={upload_images}
              value={draft.brief}
              onChange={v => set_draft(d => { d.brief = v })}
              placeholder={t("edit_brief_here")} />
          </div>
        </Collapse>
        <h2 className={csses.title}>
          <CollapseButton open={opens.desc} onClick={() => set_opens(d => { d.desc = !d.desc })} />
          {t("mod_description")}
        </h2>
        <Collapse open={opens.desc} classNames={{ inner: csses.collapse_inner }}>
          <div className={csses.md_editor}>
            <EditorView
              uploadImages={upload_images}
              value={draft.desc}
              onChange={v => set_draft(d => { d.desc = v })}
              placeholder={t("edit_description_here")} />
          </div>
        </Collapse>
        <h2 className={csses.title}>
          <CollapseButton open={opens.changelog} onClick={() => set_opens(d => { d.changelog = !d.changelog })} />
          {t("mod_changelog")}
        </h2>
        <Collapse open={opens.changelog} classNames={{ inner: csses.collapse_inner }}>
          <div className={csses.md_editor}>
            <EditorView
              uploadImages={upload_images}
              value={draft.changelog}
              onChange={v => set_draft(d => { d.changelog = v })}
              placeholder={t("edit_changelog_here")} />
          </div>
        </Collapse>
      </div>
      <div className={csses.foot}>
        <div style={{ flex: 1 }} />
        <IconButton
          style={{ fontSize: '2rem' }}
          title={t('save_mod_info')}
          container={tool_tips_container}
          disabled={loading || cover_uploading}
          onClick={save}>
          {t('save')}
        </IconButton>
      </div>
      <Loading big absolute center loading={loading} />
    </div>
  );
}
