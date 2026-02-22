import type { IRecord } from "@/api/listModRecords";
import img_browser from "@/assets/svg/browser.svg";
import type { Info } from "@/base/Info";
import { IconButton } from "@/components/button/IconButton";
import { ShareButton } from "@/components/button/ShareButton";
import { useTranslation } from "react-i18next";
import { MarkdownButton } from "../main/MarkdownModal";
import { icons, InfoUrlType } from "../yours/InfoUrlType";
import { EditModButton } from "./EditModButton";

export interface IInfoActionsProps {
  record?: IRecord | null;
  info?: Info | null;
}
export function InfoActions(props: IInfoActionsProps) {
  const { info, record } = props
  const { t } = useTranslation()
  const { url, url_type, more_urls } = info ?? {};
  return <>
    <IconButton
      title={t('' + url_type)}
      href={url}
      gone={!url}
      icon={img_browser} />
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
    <MarkdownButton info={info} />
    <ShareButton info={info} />
    <EditModButton me={record} />
  </>
}