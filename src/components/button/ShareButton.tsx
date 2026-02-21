import type { Info } from "@/base/Info";
import { Paths } from "@/Paths";
import { interrupt_event } from "@/utils/interrupt_event";
import { useCallback } from "react";
import { useTranslation } from "react-i18next";
import { IconButton } from "./IconButton";
import img_share from "@/assets/svg/share.svg";
import Toast from "@/gimd/Toast";

export function ShareButton(props: { info: Info | undefined | null }) {
  const { t } = useTranslation()
  const { info } = props
  const { id } = info || {}
  const on_click = useCallback((e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
    interrupt_event(e);
    if (!id) return;
    const url = `${location.protocol}//${location.host}/#${Paths.All.Info.replace(':game_id', '' + id)}`
    navigator.clipboard.writeText(url).then(() => {
      Toast.success(`URL has been copied: \n ${url}`)
    }).catch(e => {
      Toast.error(e)
    });
  }, [id])
  return (
    <IconButton
      gone={!id}
      title={t('share')}
      icon={img_share}
      onClick={on_click} />
  );
}
