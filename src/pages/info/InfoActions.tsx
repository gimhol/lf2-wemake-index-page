import type { IRecord } from "@/api/listModRecords";
import type { Info } from "@/base/Info";
import { IconButton } from "@/components/button/IconButton";
import { ShareButton } from "@/components/button/ShareButton";
import { Paths } from "@/Paths";
import { useTranslation } from "react-i18next";
import { MarkdownButton } from "../main/MarkdownModal";
import { icons, InfoUrlType } from "../yours/InfoUrlType";
import { EditModButton } from "./EditModButton";
import { Tooltip } from "@/gimd/Tooltip";
import GlobalStore from "@/GlobalStore";
import { useContext } from "react";
import { ewents } from "@/utils/ewents";

export interface IInfoActionsProps {
  record?: IRecord | null;
  info?: Info | null;
}
export function InfoActions(props: IInfoActionsProps) {
  const { info, record } = props
  const { t } = useTranslation()
  const { url, url_type, more_urls } = info ?? {};
  const { value: { user_id } } = useContext(GlobalStore.context);

  return <>
    <IconButton
      {...ewents.click('InfoAction', { url_type, url, id: info?.id, title: info?.title })}
      title={t('' + url_type)}
      href={url}
      gone={!url}
      icon={icons[url_type as InfoUrlType]} />
    {
      more_urls?.map((u, idx) => {
        const { url_name, url, url_type } = u
        return (
          <IconButton
            {...ewents.click('InfoAction', { url_type, url, url_name, id: info?.id, title: info?.title })}
            key={idx}
            title={url_name}
            href={url}
            icon={icons[url_type as InfoUrlType]} />
        )
      })
    }
    {user_id ? <MarkdownButton info={info} /> : null}
    <ShareButton
      {...ewents.click('ShareButton', { id: info?.id, title: info?.title })}
      info={info} />
    <EditModButton me={record} />
  </>
}

export function IdLink(props: IInfoActionsProps) {
  const { info } = props;
  if (!info) return <></>
  const href = `${location.protocol}//${location.host}/#${Paths.All.Info.replace(':game_id', '' + info?.id)}`;

  return (
    <Tooltip title='Open in New Page'>
      <a
        {...ewents.click('IdLink', { id: info?.id, title: info?.title, href })}
        href={href}
        target='_blank'
        style={{ display: 'inline' }}
        onClick={e => e.stopPropagation()}>
        <span style={{ fontSize: `0.8em`, opacity: 0.5 }}>id:</span>{info?.id}
      </a>
    </Tooltip>
  )
}