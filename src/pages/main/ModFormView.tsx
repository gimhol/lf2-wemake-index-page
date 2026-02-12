import { EditorView } from "@/components/markdown/editor/EditorView";
import Toast from "@/gimd/Toast";
import { useOSSUploadModImages } from "@/hooks/useOSSUploadModImages";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import csses from "./ModFormView.module.scss";
import { ossUploadModFiles, type IUploadFileResult } from "@/hooks/ossUploadModFiles";
import { useOSS } from "@/hooks/useOSS";
import { file_size_txt } from "@/utils/file_size_txt";
import { IconButton } from "@/components/button/IconButton";
export interface IModFormViewProps {
  mod_id?: number;
}
export function ModFormView(props: IModFormViewProps) {
  const { mod_id } = props;
  const { t } = useTranslation();
  const [tab, set_tab] = useState<'base_info' | 'changelog' | 'description'>('base_info');
  const [toast, toast_ctx] = Toast.useToast()
  const upload_images = useOSSUploadModImages({ mod_id, toast })
  const [oss, sts] = useOSS()
  const [cover_progress, set_cover_progress] = useState<[number, number]>()
  const [data_progress, set_data_progress] = useState<[number, number]>()
  const [cover_upload_result, set_cover_upload_result] = useState<IUploadFileResult[]>([])
  const [data_upload_result, set_data_upload_result] = useState<IUploadFileResult[]>([])
  return (
    <div className={csses.mod_form_view}>
      {toast_ctx}{mod_id}
      <h2 className={csses.title}>
        {t('edit_your_extra_data_info')}
      </h2>
      <div className={csses.main}>
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <button className={'base_info' == tab ? csses.btn_actived : csses.btn_normal} onClick={() => set_tab('base_info')}>
            {t("base_info")}
          </button>
          <button className={'description' == tab ? csses.btn_actived : csses.btn_normal} onClick={() => set_tab('description')}>
            {t("description")}
          </button>
          <button className={'changelog' == tab ? csses.btn_actived : csses.btn_normal} onClick={() => set_tab('changelog')}>
            {t("changelog")}
          </button>
        </div>
        <div className={csses.right_zone}>
          <div className={csses.base_info} style={{ display: tab === 'base_info' ? void 0 : 'none' }}>
            <div className={csses.form_row}>
              <span>{t('data_zip_title')}:</span>
              <input className={csses.txt_input} type="text" placeholder={t("edit_title_here")} maxLength={50} />
            </div>
            <div className={csses.form_row}>
              <span>{t('author')}:</span>
              <input className={csses.txt_input} type="text" placeholder={t("edit_author_here")} maxLength={50} />
            </div>
            <div className={csses.form_row}>
              <span>{t('author_url')}:</span>
              <input className={csses.txt_input} type="text" placeholder={t("edit_author_url_here")} maxLength={50} />
            </div>
            <div className={csses.form_row}>
              <span>{t('cover_img')}:</span>
              <input
                className={csses.file_input}
                type="file"
                accept=".png;.jpg;.webp"
                onDragOver={e => { e.stopPropagation() }}
                onDrop={e => { e.stopPropagation() }}
                onChange={e => {
                  if (!e.target.files?.length) return;
                  const files = Array.from(e.target.files)
                  ossUploadModFiles({
                    mod_id, files, oss, sts, limits: {
                      'image/png': { max_size: 5 * 1024 * 1024 },
                      'image/jpeg': { max_size: 5 * 1024 * 1024 },
                      'image/webp': { max_size: 5 * 1024 * 1024 },
                    },
                    progress: (progress, info) => {
                      set_cover_progress(prev => {
                        const file_size = info?.fileSize ?? prev?.[1] ?? 0
                        return [progress, file_size]
                      })
                    }
                  }).then((r) => {
                    set_cover_upload_result(r)
                  }).catch((err) => {
                    toast.error(err)
                    e.target.files = null;
                  })
                }} />
              {
                cover_upload_result.map(r => {
                  return (<IconButton>
                    <img key={r.url}
                      src={r.url}
                      width={20}
                      height={20}
                      style={{ objectFit: 'cover', alignSelf: 'center' }} />
                  </IconButton>)
                })
              }
              {
                cover_progress ?
                  <div className={csses.upload_result}>
                    <div>progress: {(100 * cover_progress[0]).toFixed(2)}%</div>
                    <div>size: {file_size_txt(cover_progress[1])}</div>
                  </div> : null
              }
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

              {
                data_progress ?
                  <div className={csses.upload_result}>
                    <div>progress: {(100 * data_progress[0]).toFixed(2)}%</div>
                    <div>size: {file_size_txt(data_progress[1])}</div>
                  </div> : null
              }
            </div>
          </div>
          <div className={csses.md_editor} style={{ display: tab === 'description' ? void 0 : 'none' }}>
            <EditorView
              uploadImages={upload_images}
              placeholder={t("edit_description_here")} />
          </div>
          <div className={csses.md_editor} style={{ display: tab === 'changelog' ? void 0 : 'none' }}>
            <EditorView
              uploadImages={upload_images}
              placeholder={t("edit_changelog_here")} />
          </div>
        </div>
      </div>
    </div>
  );
}

