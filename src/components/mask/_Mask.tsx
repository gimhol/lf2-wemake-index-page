/* eslint-disable react-hooks/rules-of-hooks */
import { usePropState } from "@/utils/usePropState";
import classnames from "classnames";
import { useContext, useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useRefNow } from "../../hooks/useRefNow";
import { mask_context } from "./_Provider";
import { ctrl_a_bounding } from "./ctrl_a_bounding";
import csses from "./styles.module.scss";

export interface _IMaskProps extends React.HTMLAttributes<HTMLDivElement> {
  open?: boolean;
  whenChange?(open?: boolean): void;
  afterClose?(): void;
  closeOnMask?: boolean;
  container?: Element | (() => Element);
}
export function _Mask(props: _IMaskProps) {
  const {
    style, open: __open, whenChange, className, closeOnMask = true,
    onClick, onKeyDown, afterClose, container, ..._p
  } = props;
  const [is_open, set_is_open] = usePropState(__open, whenChange);

  const { new_mask_id, masks, open, close } = useContext(mask_context);
  const mask_id = useMemo(() => new_mask_id(), [new_mask_id])

  const ref_el = useRef<HTMLDivElement>(null)
  const cls_root = classnames(csses.mask, className)
  const sty_root: React.CSSProperties = useMemo(() => {
    const zIndex = 10 + masks.indexOf(mask_id);
    const last = zIndex == 10 + (masks.length - 1)
    const ret: React.CSSProperties = {
      ...style,
      opacity: is_open ? 1 : void 0,
      pointerEvents: is_open ? 'all' : void 0,
      zIndex,
    }
    if (!last) ret.filter = `blur(5px)`
    return ret;
  }, [style, is_open, masks, mask_id])

  const ref_afterClose = useRefNow(afterClose)
  const [gone, set_gone] = useState(!is_open);

  useEffect(() => {
    if (is_open) {
      open(mask_id);
      return () => close(mask_id)
    }
    close(mask_id)

  }, [is_open, open, close, mask_id])

  useEffect(() => {
    if (is_open) {
      set_gone(false);
      ref_el.current?.focus();
      return;
    }
    const tid = setTimeout(() => {
      ref_afterClose.current?.();
      set_gone(true)
    }, 1000);
    return () => clearTimeout(tid)
  }, [is_open, ref_afterClose])

  const inner = (
    <div
      {..._p}
      ref={ref_el}
      data-mask-id={mask_id}
      tabIndex={-1}
      style={sty_root}
      className={cls_root}
      autoFocus
      onKeyDown={e => {
        if (onKeyDown) return onKeyDown?.(e);
        if (e.key.toLowerCase() === 'escape') {
          e.stopPropagation();
          e.preventDefault();
          set_is_open(false);
        }
        ctrl_a_bounding(e, ref_el.current)
      }}
      onClick={e => {
        if (onClick) return onClick?.(e);
        if (!closeOnMask) return;
        if (e.target !== ref_el.current) return;
        e.stopPropagation();
        e.preventDefault();
        set_is_open(false);
      }}
    />
  )
  if (gone) return;
  if (container)
    return createPortal(inner,
      typeof container === 'function' ? container() : container)
  return inner
}