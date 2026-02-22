
import type { IRecord } from "@/api/listModRecords";
import img_edit from "@/assets/svg/edit.svg";
import { IconButton, type IIconButtonProps } from "@/components/button/IconButton";
import { interrupt_event } from "@/utils/interrupt_event";
import { useContext } from "react";
import { useTranslation } from "react-i18next";
import { ModContext } from "../mod_form/ModContext";

export interface IEditModButtonProps extends IIconButtonProps {
  me?: IRecord;
}

export function EditModButton(props: IEditModButtonProps) {
  const { me, ..._p } = props
  const { t } = useTranslation();
  const { edit: set_open } = useContext(ModContext);
  const title = me?.type ? t('edit_%1_info').replace('%1', t(`d_${me.type}`)) : t('edit')
  return <>
    <IconButton
      icon={img_edit}
      title={title}
      onClick={(e) => {
        interrupt_event(e);
        set_open(me);
      }}
      {..._p} />
  </>

}