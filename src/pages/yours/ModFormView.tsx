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
import { ossUploadModRecords } from "@/hooks/ossUploadModRecords";
import { useOSS } from "@/hooks/useOSS";
import { useOSSUploadModImages } from "@/hooks/useOSSUploadModImages";
import { interrupt_event } from "@/utils/interrupt_event";
import classnames from "classnames";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useImmer } from "use-immer";
import csses from "./ModFormView.module.scss";
import { get_mod, type IMod } from "./get_mod";
import { replace_one } from "./join_url";
import { save_mod } from "./save_mod";
export interface IModFormViewProps {
  mod_id?: number;
}
const uploaded_map = new Map<File, IPickedFile>();

export function ModFormView(props: IModFormViewProps) {
  const { mod_id } = props;
  const { t } = useTranslation();
  const [toast, toast_ctx] = Toast.useToast()
  const upload_images = useOSSUploadModImages({ mod_id, toast })
  const [oss, sts] = useOSS()
  const [draft, set_draft] = useImmer<IInfo>({})
  const [mod, set_mod] = useImmer<IMod | null>(null)
  const [loading, set_loading] = useState(!!mod_id);
  const [cover_uploading, set_cover_uploading] = useState(false);
  const [covers, set_covers] = useState<IPickedFile[]>()
  const [attachments, set_attachments] = useState<IPickedFile[]>()
  const [attachment_uploading, set_attachment_uploading] = useState(false);
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
        if (r.info.full_cover_url)
          set_covers([{ url: r.info.full_cover_url }])
      }).catch(e => {
        if (ab.signal.aborted) return;
        toast.error(e)
      }).finally(() => {
        if (ab.signal.aborted) return;
        set_loading(false)
      })
    return () => ab.abort()
  }, [mod_id, toast, oss, sts, set_mod, set_draft])

  const tool_tips_container = () => document.getElementsByClassName(csses.mod_form_view).item(0)!

  const save = () => {
    if (!mod) return;
    set_loading(true)
    const next = mod.info.load(draft).clone().set_id('' + mod_id);
    save_mod({ mod_id, oss, sts, info: next })
      .then(() => {
        return get_mod({ mod_id, oss, sts })
      }).then(r => {
        set_draft(r.info.raw)
        set_mod(r)
        if (r.info.full_cover_url)
          set_covers([{ url: r.info.full_cover_url }])
      }).catch(e => {
        toast.error(e)
      }).finally(() => {
        set_loading(false)
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
                  const name = r[0].url.split('/').pop();
                  set_draft(d => { d.cover_url = name })
                }).catch((err) => {
                  toast.error(err)
                }).finally(() => {
                  set_cover_uploading(false);
                })
              }}>
              <PickFile.Images onFileClick={(_, r, { files }) => {
                ImagesViewer.open(files, files?.findIndex(v => v.url === r.url))
              }} />
            </PickFile>
          </div>
          <div className={csses.form_row}>
            <span>{t('data_zip')}:</span>
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
                  set_draft(d => {
                    d.url = name;
                    d.url_type = 'download'
                  })
                }).catch((err) => {
                  toast.error(err)
                }).finally(() => {
                  set_attachment_uploading(false);
                })
              }}>
              <PickFile.Files />
            </PickFile>
          </div>
        </Collapse>
        <h2 className={csses.title}>
          <CollapseButton open={opens.brief} onClick={() => set_opens(d => { d.brief = !d.brief })} />
          {t("mod_brief")}
        </h2>
        <Collapse open={opens.brief} classNames={{ inner: csses.collapse_inner }}>
          <div className={csses.brief_editor}>
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
          disabled={loading || cover_uploading || attachment_uploading}
          onClick={save}>
          {t('save')}
        </IconButton>
      </div>
      <Loading big absolute center loading={loading} />
    </div>
  );
}
