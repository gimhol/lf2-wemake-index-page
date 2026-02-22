import { IconButton } from "@/components/button/IconButton";
import { LangButton } from "@/components/LangButton";
import { Mask, type IMaskProps } from "@/components/mask";
import { interrupt_event } from "@/utils/interrupt_event";
import csses from "./ModFormModal.module.scss";
import { ModFormView } from "./ModFormView";

export interface IModFormModalProps extends IMaskProps {
  _?: never;
  mod_id?: number;
}
export function ModFormModal(props: IModFormModalProps) {
  const { container = document.body,  whenChange, mod_id, ..._p } = props;
  return (
    <Mask container={container} whenChange={whenChange} {..._p}>
      <ModFormView mod_id={mod_id} />
      <div className={csses.right_top}>
        <LangButton />
        <IconButton
          icon='✖︎'
          onClick={e => { interrupt_event(e); whenChange?.(false) }} />
      </div>
    </Mask>
  );
}


