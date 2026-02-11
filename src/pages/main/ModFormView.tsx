import { EditorView } from "@/components/markdown/editor/EditorView";
import Toast from "@/gimd/Toast";
import { useOSS } from "@/hooks/useOSS";
import { read_blob_as_md5 } from "@/utils/read_blob_as_md5";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import csses from "./ModFormView.module.scss";
export interface IModFormViewProps {
  mod_id?: number;
}
export function ModFormView(props: IModFormViewProps) {
  const { mod_id } = props;
  const { t } = useTranslation();
  const [oss, { dir }] = useOSS();
  const [tab, set_tab] = useState<'base_info' | 'changelog' | 'description'>('base_info');
  const [toast, toast_ctx] = Toast.useToast()
  return (
    <div className={csses.mod_form_view}>
      {toast_ctx}
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
              <input className={csses.file_input} type="file" accept=".png;.jpg;.webp" />
            </div>
            <div className={csses.form_row}>
              <span>{t('data_zip')}:</span>
              <input className={csses.file_input} type="file" accept=".zip" />
            </div>
          </div>
          <div className={csses.md_editor} style={{ display: tab === 'description' ? void 0 : 'none' }}>
            <EditorView placeholder={t("edit_description_here")} />
          </div>
          <div className={csses.md_editor} style={{ display: tab === 'changelog' ? void 0 : 'none' }}>
            <EditorView
              uploadImages={(oss && mod_id) ? async (files) => {
                const too_large = files.some(v => v.size > 5 * 1024 * 1024)
                if (too_large) {
                  const err = new Error('image file size must be <= 5MB')
                  toast.error(err.message)
                  return Promise.reject(err)
                }
                return Promise.all(files.map(async f => {
                  const md5 = await read_blob_as_md5(f);
                  const encoded_name = encodeURIComponent(f.name)
                  const r = await oss.put(`${dir}/${mod_id}/${md5}`, f, {
                    mime: "image",
                    headers: {
                      "Content-Type": f.type,
                      'Content-Disposition': `attachment;filename=${encoded_name};filename*=UTF-8''${encoded_name}`
                    }
                  });
                  return {
                    url: r.url, alt: f.name, title: f.name
                  };
                }
                ))
              } : void 0}
              placeholder={t("edit_changelog_here")} />
          </div>
        </div>
      </div>
    </div>
  );
}

