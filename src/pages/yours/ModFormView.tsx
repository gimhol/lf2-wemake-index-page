/* eslint-disable react-hooks/set-state-in-effect */
import { findModFile } from "@/api/findModFile";
import { getUserInfo, type IUserInfo } from "@/api/getUserInfo";
import { type IFileInfo } from "@/api/listModFiles";
import { Info, type IInfo } from "@/base/Info";
import { CollapseButton } from "@/components/button/CollapseButton";
import { IconButton } from "@/components/button/IconButton";
import { Collapse } from "@/components/collapse/Collapse";
import { Loading } from "@/components/loading";
import { EditorView } from "@/components/markdown/editor/EditorView";
import Toast from "@/gimd/Toast";
import { ossUploadModFiles, type IUploadFileResult } from "@/hooks/ossUploadModFiles";
import { useOSS } from "@/hooks/useOSS";
import { useOSSUploadModImages } from "@/hooks/useOSSUploadModImages";
import { file_size_txt } from "@/utils/file_size_txt";
import { interrupt_event } from "@/utils/interrupt_event";
import type OSS from "ali-oss";
import classnames from "classnames";
import { MD5 } from "crypto-js";
import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import csses from "./ModFormView.module.scss";
export interface IModFormViewProps {
  mod_id?: number;
}

function get_mod_paths_names(owner_id: number, mod_id: number) {
  const dir = `user/${owner_id}/${mod_id}`;
  const info_obj_name = MD5(`${mod_id}/info`).toString()
  const cover_obj_name = MD5(`${mod_id}/cover`).toString()
  const data_obj_name = MD5(`${mod_id}/data`).toString()
  const desc_obj_name = MD5(`${mod_id}/desc`).toString()
  const children_obj_name = MD5(`${mod_id}/children`).toString()
  const info_obj_path = dir + '/' + info_obj_name
  const cover_obj_path = dir + '/' + cover_obj_name
  const data_obj_path = dir + '/' + data_obj_name
  const desc_obj_path = dir + '/' + desc_obj_name
  const children_obj_path = dir + '/' + children_obj_name
  return {
    info_obj_name,
    cover_obj_name,
    data_obj_name,
    desc_obj_name,
    children_obj_name,
    info_obj_path,
    cover_obj_path,
    data_obj_path,
    desc_obj_path,
    children_obj_path
  }
}

export interface IGetModFormOpts {
  mod_id?: number;
  oss?: OSS;
  sts?: IOSSStsInfo;
}
// eslint-disable-next-line react-refresh/only-export-components
export async function get_mod_form_infos(opts: IGetModFormOpts) {
  const { mod_id, oss, sts } = opts;
  if (!mod_id || !oss || !sts) throw new Error('!')
  const mod_info = await findModFile({ id: mod_id });
  if (!mod_info.owner_id) throw new Error('mod not found!');

  const owner_info = await getUserInfo({ id: mod_info.owner_id })
  const paths_names = get_mod_paths_names(owner_info.id, mod_id)
  const raw_info = await oss.get(paths_names.info_obj_path).then<IInfo>(r => {
    return JSON.parse(new TextDecoder().decode(r.content))
  }).catch(e => {
    if (e.name !== 'NoSuchKeyError') throw e
    return {} as IInfo
  })

  const info = new Info(raw_info, '', null, null);
  info.author_url = info.author_url || owner_info?.home_url || owner_info?.gitee_url || owner_info?.github_url;
  info.author = info.author || owner_info.username || owner_info.username;
  info.title = info.title || mod_info.name;
  return { info, mod_info, owner_info }
}
export function ModFormView(props: IModFormViewProps) {
  const { mod_id } = props;
  const { t } = useTranslation();
  const [toast, toast_ctx] = Toast.useToast()
  const upload_images = useOSSUploadModImages({ mod_id, toast })
  const [oss, sts] = useOSS()
  const [cover_progress, set_cover_progress] = useState<[number, number]>()
  const [data_progress, set_data_progress] = useState<[number, number]>()
  const cover_upload_status = !cover_progress ? 'none' :
    cover_progress[0] >= 1 ? 'done' : 'uploading'
  const data_upload_status = !data_progress ? 'none' :
    data_progress[0] >= 1 ? 'done' : 'uploading'

  const [cover_upload_result, set_cover_upload_result] = useState<IUploadFileResult[]>([])
  const [, set_data_upload_result] = useState<IUploadFileResult[]>([])
  const [, set_mod_info] = useState<IFileInfo>();
  const [owner, set_owner] = useState<IUserInfo>();
  const [loading, set_loading] = useState(!!mod_id);
  const [info, set_info] = useState<Info>(() => Info.empty())

  const names = useMemo(() => {
    if (!mod_id || !owner?.id) return void 0
    return get_mod_paths_names(owner.id, mod_id)
  }, [owner, mod_id])

  useEffect(() => {
    if (!mod_id || !sts) {
      set_loading(false)
      return;
    }
    set_loading(true);
    const ab = new AbortController();
    get_mod_form_infos({ mod_id, oss, sts })
      .then(r => {
        if (ab.signal.aborted) return;
        set_owner(r.owner_info)
        set_mod_info(r.mod_info)
        set_info(r.info);
      }).catch(e => {
        if (ab.signal.aborted) return;
        toast(e)
      }).finally(() => {
        if (ab.signal.aborted) return;
        set_loading(false)
      })
    return () => ab.abort()
  }, [mod_id, toast, oss, sts])

  const tool_tips_container = () => document.getElementsByClassName(csses.mod_form_view).item(0)!

  const save = () => {
    if (!oss || !sts || !names || !mod_id) return;
    set_loading(true)

    const available = data_progress?.[0] == 1;
    console.log(cover_progress?.[0])
    const next = info.clone()
      .set_id('' + mod_id)
      .set_cover_url(cover_progress?.[0] == 1 ? names.cover_obj_name : void 0)
      .set_url(available ? names.data_obj_name : void 0)
      .set_unavailable(available ? void 0 : 'unpublish')

    const json_blob = new Blob([JSON.stringify(next.raw)], { type: 'application/json; charset=utf-8' })
    oss.put(names.info_obj_path, json_blob).then(() => {
      console.log(sts.base + names.info_obj_path)
      return oss.head(names.info_obj_path)
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
  const [desc_open, set_desc_open] = useState(true);
  const [changelog_open, set_changelog_open] = useState(true)
  const [base_open, set_base_open] = useState(true)
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
          <CollapseButton open={base_open} onClick={() => set_base_open(!base_open)} />
          {t("mod_base_info")}
        </h2>
        <Collapse open={base_open} classNames={{ inner: csses.base_info }}>
          <div className={csses.form_row}>
            <span>{t('data_zip_title')}:</span>
            <input
              className={csses.txt_input}
              value={info?.title}
              onChange={e => {
                interrupt_event(e)
                set_info(prev => prev.clone().set_title(e.target.value))
              }}
              type="text"
              placeholder={t("edit_title_here")}
              maxLength={50} />
          </div>
          <div className={csses.form_row}>
            <span>{t('author')}:</span>
            <input
              className={csses.txt_input}
              value={info?.author}
              onChange={e => {
                interrupt_event(e)
                set_info(prev => prev.clone().set_author(e.target.value))
              }}
              type="text"
              placeholder={t("edit_author_here")}
              maxLength={50} />
          </div>
          <div className={csses.form_row}>
            <span>{t('author_url')}:</span>
            <input
              className={csses.txt_input}
              value={info.author_url}
              type="text"
              onChange={e => {
                interrupt_event(e)
                set_info(prev => prev.clone().set_author_url(e.target.value))
              }}
              placeholder={t("edit_author_url_here")}
              maxLength={255} />
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
                  getObjectName: async () => {
                    if (!names) throw new Error('not ready!')
                    return names.cover_obj_path
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
          </div>
          <div style={{ display: 'flex' }}>
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
                  getObjectName: async () => {
                    if (!names) throw new Error('not ready!')
                    return names.data_obj_path
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
          <CollapseButton open={desc_open} onClick={() => set_desc_open(!desc_open)} />
          {t("mod_description")}
        </h2>
        <Collapse open={desc_open} classNames={{ inner: csses.collapse_inner }}>
          <div className={csses.md_editor}>
            <EditorView
              uploadImages={upload_images}
              value={info.desc}
              onChange={v => set_info(prev => prev.clone().set_desc(v))}
              placeholder={t("edit_description_here")} />
          </div>
        </Collapse>
        <h2 className={csses.title}>
          <CollapseButton open={changelog_open} onClick={() => set_changelog_open(!changelog_open)} />
          {t("mod_changelog")}
        </h2>
        <Collapse open={changelog_open} classNames={{ inner: csses.collapse_inner }}>
          <div className={csses.md_editor}>
            <EditorView
              uploadImages={upload_images}
              value={info.changelog}
              onChange={v => set_info(prev => prev.clone().set_changelog(v))}
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
          disabled={loading || cover_upload_status === 'uploading' || data_upload_status === 'uploading'}
          onClick={save}>
          {t('save')}
        </IconButton>
      </div>
      <Loading big absolute center loading={loading} />
    </div>
  );
}
