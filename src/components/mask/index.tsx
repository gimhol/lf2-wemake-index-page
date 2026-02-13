import classnames from "classnames";
import { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import csses from "./styles.module.scss";
import { ctrl_a_bounding } from "./ctrl_a_bounding";
import { useRefNow } from "../../hooks/useRefNow";

export interface IMaskProps extends React.HTMLAttributes<HTMLDivElement> {
  open?: boolean;
  onClose?(): void;
  afterClose?(): void;
  closeOnMask?: boolean;
  container?: Element | (() => Element);
  container_blur?: boolean
}
let _mask_count = 0;

export function Mask(props: IMaskProps) {
  const {
    container_blur = true,
    style, open, onClose, className, closeOnMask = true,
    onClick, onKeyDown, afterClose, container, ..._p
  } = props;
  const ref_el = useRef<HTMLDivElement>(null)
  const cls_root = classnames(csses.mask, className)
  const sty_root: React.CSSProperties = useMemo(() => ({
    ...style,
    opacity: open ? 1 : void 0,
    pointerEvents: open ? 'all' : void 0,
  }), [style, open])

  const ref_afterClose = useRefNow(afterClose)
  const [gone, set_gone] = useState(!open);
  useEffect(() => {
    if (open) {
      set_gone(false)
      _mask_count++;
      ref_el.current?.focus();
    }
    if (container_blur)
      document.getElementById('root')!.style.filter = _mask_count ? `blur(${_mask_count * 5}px)` : ''
    if (open) return () => { _mask_count-- };
    const tid = setTimeout(() => {
      ref_afterClose.current?.();
      set_gone(true)
    }, 1000);
    return () => clearTimeout(tid)
  }, [open, container_blur, ref_afterClose])

  const inner = (
    <div {..._p}
      ref={ref_el}
      tabIndex={-1}
      style={sty_root}
      className={cls_root}
      autoFocus
      onKeyDown={e => {
        if (onKeyDown) return onKeyDown?.(e);
        if (e.key.toLowerCase() === 'escape') {
          e.stopPropagation();
          e.preventDefault();
          onClose?.();
        }
        ctrl_a_bounding(e, ref_el.current)
      }}
      onClick={e => {
        if (onClick) return onClick?.(e);
        if (!closeOnMask) return;
        if (e.target !== ref_el.current) return;
        e.stopPropagation();
        e.preventDefault();
        onClose?.();
      }}
    />
  )
  if (gone) return;
  if (container)
    return createPortal(inner, typeof container === 'function' ? container() : container)
  return inner
}