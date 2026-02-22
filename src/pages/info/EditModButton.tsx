
import type { IRecord } from "@/api/listModRecords";
import img_edit from "@/assets/svg/edit.svg";
import { AdminValue } from "@/base/AdminValue";
import { IconButton, type IIconButtonProps } from "@/components/button/IconButton";
import GlobalStore from "@/GlobalStore";
import { interrupt_event } from "@/utils/interrupt_event";
import { useContext } from "react";
import { useTranslation } from "react-i18next";
import { ModContext } from "../mod_form/ModContext";

export interface IEditModButtonProps extends IIconButtonProps {
  me?: IRecord | null;
}

export function EditModButton(props: IEditModButtonProps) {
  const { me, gone, ..._p } = props
  const { t } = useTranslation();
  const { edit: set_open } = useContext(ModContext);
  const title = me?.type ? t('edit_%1_info').replace('%1', t(`d_${me.type}`)) : t('edit')
  const { value: { user_id, admin } } = useContext(GlobalStore.context);

  return <>
    <IconButton
      icon={img_edit}
      title={title}
      gone={gone || (me?.owner_id !== user_id && ((admin & AdminValue.WR) != AdminValue.WR))}
      onClick={(e) => {
        interrupt_event(e);
        set_open(me);
      }}
      {..._p} />
  </>

}