import type { IRecord } from "@/api/listModRecords";
import img_browser from "@/assets/svg/browser.svg";
import img_win64 from "@/assets/svg/windows_x64.svg";
import type { Info } from "@/base/Info";
import { IconButton } from "@/components/button/IconButton";
import { ShareButton } from "@/components/button/ShareButton";
import { useTranslation } from "react-i18next";
import { MarkdownButton } from "../main/MarkdownModal";
import { EditModButton } from "./EditModButton";

export interface IInfoActionsProps {
  record?: IRecord | null;
  info?: Info | null;
}
export function InfoActions(props: IInfoActionsProps) {
  const { info, record } = props
  const { t } = useTranslation()
  const { url, url_type } = info ?? {};
  const win_x64_url = info?.get_url_by_name('win_x64')
  const dl_win_x64 = t('dl_win_x64')
  return <>
    <IconButton
      title={t('' + url_type)}
      href={url}
      gone={!url}
      icon={img_browser} />
    <IconButton
      title={dl_win_x64}
      href={win_x64_url}
      gone={!win_x64_url}
      icon={img_win64} />
    <MarkdownButton info={info} />
    <ShareButton info={info} />
    <EditModButton me={record} />
  </>
}