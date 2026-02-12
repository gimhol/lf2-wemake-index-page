import { EditorView } from "@/components/markdown/editor/EditorView";
import Toast from "@/gimd/Toast";
import { useOSSUploadModImages } from "@/hooks/useOSSUploadModImages";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import csses from "./ModFormView.module.scss";
export interface IModFormViewProps {
  mod_id?: number;
}



export function ModFormView(props: IModFormViewProps) {
  const { mod_id } = props;
  const { t } = useTranslation();
  const [tab, set_tab] = useState<'base_info' | 'changelog' | 'description'>('base_info');
  const [toast, toast_ctx] = Toast.useToast()
  const upload_images = useOSSUploadModImages({ mod_id, toast })
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

