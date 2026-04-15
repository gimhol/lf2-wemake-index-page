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
      title={t('' + url_type)}
      href={url}
      gone={!url}
      icon={icons[url_type as InfoUrlType]} />
    {
      more_urls?.map((u, idx) => {
        return (
          <IconButton
            key={idx}
            title={u.url_name}
            href={u.url}
            icon={icons[u.url_type as InfoUrlType]} />
        )
      })
    }
    {user_id ? <MarkdownButton info={info} /> : null}
    <ShareButton info={info} />
    <EditModButton me={record} />
  </>
}

export function IdLink(props: IInfoActionsProps) {
  const { info } = props;
  if (!info) return <></>
  const href = `${location.protocol}//${location.host}/#${Paths.All.Info.replace(':game_id', '' + info?.id)}`;

  return (
    <Tooltip title='Open in New Page'>
      <a href={href} target='_blank' style={{ display: 'inline' }} onClick={e => e.stopPropagation()}>
        <span style={{ fontSize: `0.8em`, opacity: 0.5 }}>id:</span>{info?.id}
      </a>
    </Tooltip>
  )
}