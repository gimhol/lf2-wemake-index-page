/* eslint-disable react-hooks/set-state-in-effect */
import { type IUrl } from "@/base/Info";
import { IconButton } from "@/components/button/IconButton";
import { PickFile } from "@/components/pickfile";
import type { IPickedFile } from "@/components/pickfile/_Common";
import { Dropdown } from "@/gimd/Dropdown";
import Toast from "@/gimd/Toast";
import { ossUploadModRecords } from "@/hooks/ossUploadModRecords";
import { useOSS } from "@/hooks/useOSS";
import { interrupt_event } from "@/utils/interrupt_event";
import { useEffect, useState, type ReactNode } from "react";
import { useTranslation } from "react-i18next";
import { all_info_url_type, InfoUrlType } from "../yours/InfoUrlType";
import { replace_one } from "../yours/join_url";
import csses from "./ModFormView.module.scss";
import { uploaded_map } from "./uploaded_map";


export function FormLinkRow(props: {
  mod_id: number,
  me: IUrl,
  title?: ReactNode,
  remove(): void,
  change(v: IUrl): void;
}) {
  const { mod_id, me, title, remove, change } = props;
  const { t } = useTranslation();
  const [attachments, set_attachments] = useState<IPickedFile[]>()
  const [, set_uploading] = useState(false);
  const [oss, sts] = useOSS();

  useEffect(() => {
    console.log(me)
    if (me.url_type === InfoUrlType.Download && me.url)
      set_attachments([{ url: me.url, name: me.url }])
  }, [me])

  return (
    <div className={csses.form_row}>
      <span>{title}</span>
      <div className={csses.short_and_long}>
        <IconButton icon='✖︎' onClick={e => { interrupt_event(e); remove() }} />
        <Dropdown.Select
          value={me.url_type}
          placeholder={t('url_type')}
          onChange={v => change({ ...me, url_type: v })}
          options={all_info_url_type.map(v => ({ value: v, label: t(v) }))} />
        <input
          className={csses.short}
          value={me.url_name}
          type="text"
          onChange={e => {
            interrupt_event(e);
            change({ ...me, url_name: e.target.value })
          }}
          onBlur={e => {
            interrupt_event(e);
            change({ ...me, url_name: e.target.value.trim() })
          }}
          placeholder={t('url_name')}
          maxLength={255} />
        {me.url_type === InfoUrlType.Download ?
          <PickFile
            max={1}
            accept=".zip"
            value={attachments}
            whenChange={records => {
              set_attachments(records)
              if (!records?.length) return;
              set_uploading(true);
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
                change({ ...me, url: r[0].url, url_type: 'download' })
              }).catch((err) => {
                Toast.error(err)
              }).finally(() => {
                set_uploading(false);
              })
            }}>
            <PickFile.Files />
          </PickFile> :
          <input
            className={csses.long}
            value={me.url}
            type="text"
            onChange={e => {
              interrupt_event(e);
              change({ ...me, url: e.target.value })
            }}
            onBlur={e => {
              interrupt_event(e);
              change({ ...me, url: e.target.value.trim() })
            }}
            placeholder={`https://....`}
            maxLength={255} />
        }
      </div>
    </div>
  )
}