import { IconButton } from "@/components/button/IconButton";
import { ModFormView } from "./ModFormView";
import { Mask, type IMaskProps } from "@/components/mask";
import { interrupt_event } from "@/utils/interrupt_event";
import csses from "./ModFormModal.module.scss";
import { LangButton } from "@/components/LangButton";

export interface IModFormModalProps extends IMaskProps {
  _?: never;
  type?: RecordType;
  mod_id?: number;
}
export function ModFormModal(props: IModFormModalProps) {
  const { container = document.body,type, onClose, mod_id, ..._p } = props;
  return (
    <Mask container={container} onClose={onClose} {..._p}>
      <ModFormView type={type} mod_id={mod_id} />
      <div className={csses.right_top}>
        <LangButton />
        <IconButton
          icon='✖︎'
          onClick={e => { interrupt_event(e); onClose?.() }} />
      </div>

    </Mask>
  );
}