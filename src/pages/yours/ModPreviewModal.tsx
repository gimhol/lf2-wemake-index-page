/* eslint-disable react-hooks/set-state-in-effect */
import type { Info } from "@/base/Info";
import { IconButton } from "@/components/button/IconButton";
import { InfoCard } from "@/components/cards/InfoCard";
import { Loading } from "@/components/loading";
import { Mask, type IMaskProps } from "@/components/mask";
import Toast from "@/gimd/Toast";
import { interrupt_event } from "@/utils/interrupt_event";
import cns from "classnames";
import { useEffect, useState, type HTMLAttributes, type ReactNode } from "react";
import { useImmer } from "use-immer";
import { InfoView } from "../info/InfoView";
import { get_mod, type IMod } from "./get_mod";
import csses from "./ModPreviewModal.module.scss";

export interface IInfoViewModalProps extends IMaskProps {
  _?: never;
  mod_id?: number;
  info?: Info;
}
export function ModPreviewModal(props: IInfoViewModalProps) {
  const { container = document.body, mod_id, info, onClose, ..._p } = props;

  return (
    <Mask container={container} onClose={onClose} className={csses.mod_preview_modal} {..._p} >
      <ModPreview mod_id={mod_id} info={info} head={
        <div className={cns(csses.head)}>
          <h1 className={csses.title}>previewing</h1>
        </div>
      } />
      <IconButton
        style={{ position: 'absolute', right: 10, top: 10 }}
        icon='✖︎'
        onClick={e => { interrupt_event(e); onClose?.() }} />
    </Mask>
  );
}

export interface IInfoViewProps extends HTMLAttributes<HTMLDivElement> {
  _?: never;
  mod_id?: number;
  info?: Info;
  head?: ReactNode;
}
export function ModPreview(props: IInfoViewProps) {
  const { mod_id, info, head, ..._p } = props;
  const [toast, toast_ctx] = Toast.useToast()
  const [mod, set_mod] = useImmer<IMod | undefined>(void 0)
  const [loading, set_loading] = useState(false)
  useEffect(() => {
    if (!mod_id || info) {
      set_mod(void 0);
      set_loading(false);
      return
    }
    const ab = new AbortController();
    set_loading(true)
    get_mod({ mod_id }).then(r => {
      if (ab.signal.aborted) return;
      set_mod(r)
    }).catch(e => {
      if (ab.signal.aborted) return;
      toast.error(e)
    }).finally(() => {
      set_loading(false)
    })
    return () => ab.abort()
  }, [info, mod_id, set_mod, toast])

  return (
    <div className={csses.mod_preview} {..._p} >
      {toast_ctx}
      {head}
      <div className={cns(csses.main)}>
        <InfoCard info={info ?? mod?.info} />
        <div className={cns(csses.info_viewscrollview, csses.scrollview)}>
          <InfoView info={info ?? mod?.info} className={cns('bg', csses.info_view)} />
        </div>
      </div>
      <Loading loading={loading} center big absolute />
    </div>
  );
}
