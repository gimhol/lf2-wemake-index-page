import { IconButton } from "@/components/button/IconButton";
import { ModFormView } from "./ModFormView";
import { Mask, type IMaskProps } from "@/components/mask";
import { interrupt_event } from "@/utils/interrupt_event";

export interface IModFormModalProps extends IMaskProps {
  _?: never;
  mod_id?: number;
}
export function ModFormModal(props: IModFormModalProps) {
  const { container = document.body, onClose, mod_id, ..._p } = props;
  return (
    <Mask container={container} onClose={onClose} {..._p}>
      <ModFormView mod_id={mod_id} />
      <IconButton
        style={{ position: 'absolute', right: 10, top: 10 }}
        letter='✖︎'
        onClick={e => { interrupt_event(e); onClose?.() }} />
    </Mask>
  );
}