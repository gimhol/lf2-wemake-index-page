import type { Info } from "@/base/Info";
import { Mask, type IMaskProps } from "@/components/mask";
import { InfoView } from "../info/InfoView";
import csses from "./InfoViewModal.module.scss"
import cns from "classnames";
import { IconButton } from "@/components/button/IconButton";
import { interrupt_event } from "@/utils/interrupt_event";
import { InfoCard } from "@/components/cards/InfoCard";

export interface IInfoViewModalProps extends IMaskProps {
  _?: never;
  data?: Info
}
export function InfoViewModal(props: IInfoViewModalProps) {
  const { container = document.body, data, onClose, ..._p } = props;
  return (
    <Mask container={container} onClose={onClose} className={csses.info_view_modal}{..._p} >
      <div className={cns(csses.head)}>
        <h1 className={csses.title}>previewing</h1>
      </div>
      <div className={cns(csses.main)}>
        <InfoCard info={data} />
        <div className={cns(csses.info_viewscrollview, csses.scrollview)}>
          <InfoView info={data} className={cns('bg', csses.info_view)} />
        </div>
      </div>
      <IconButton
        style={{ position: 'absolute', right: 10, top: 10 }}
        letter='✖︎'
        onClick={e => { interrupt_event(e); onClose?.() }} />
    </Mask>
  );
}
