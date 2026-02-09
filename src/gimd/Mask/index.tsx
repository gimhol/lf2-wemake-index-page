import classnames from "classnames";
import { type PointerEventHandler, useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import styles from "./index.module.scss";

const State = {
  closing: 'closing',
  closed: 'closed',
  opening: 'opening',
  opened: 'opened',
} as const
type State = typeof State[keyof typeof State]


interface IBackgroundProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'children'> {
  open?: boolean;
  onClose?: () => void;
  closeOnMask?: boolean;
  clickable?: boolean;
  transparent?: boolean;
  children?: ((p: IBackgroundProps) => React.ReactNode) | React.ReactNode;
  forceRender?: boolean;
}
function Background(props: IBackgroundProps) {
  const {
    open,
    onClose,
    closeOnMask = true,
    clickable = true,
    transparent,
    children,
    forceRender = false,
    className,
    ..._p
  } = props;
  const [status, setStatus] = useState<State>(State.closed)
  const ref = useRef<HTMLDivElement>(null);
  const ref_down_on_mask = useRef<boolean>(false);

  useEffect(() => {
    if (open) {
      switch (status) {
        case State.opened: return;
        case State.opening: {
          ref.current?.focus();
          const tid = window.setTimeout(() => setStatus(State.opened), 5)
          return () => window.clearTimeout(tid);
        }
        default: return setStatus(State.opening);
      }
    } else {
      switch (status) {
        case State.closed: return;
        case State.closing:
        default: {
          setStatus(State.closing);
          const tid = window.setTimeout(() => setStatus(State.closed), 250)
          return () => window.clearTimeout(tid);
        }
      }
    }
  }, [open, status])

  const _className = useMemo(() => classnames(
    styles.mask_bg,
    {
      [styles.mask_bg_open]: status === State.opened,
      [styles.mask_bg_close]: status === State.closing,
      [styles.mask_no_pointer_event]: !clickable,
      [styles.mask_bg_transparent]: transparent,
      [styles.mask_bg_gone]: status === State.closed,
    },
    className,
  ), [transparent, clickable, status, className])

  const onPointerDown: PointerEventHandler<HTMLDivElement> = (e) => {
    if (!closeOnMask) return;
    ref_down_on_mask.current = e.target === ref.current;
  }

  const onPointerUp: PointerEventHandler<HTMLDivElement> = (e) => {
    if (!closeOnMask) return;
    if (ref_down_on_mask.current && e.target === ref.current) {
      onClose?.()
      e.stopPropagation();
      e.preventDefault();
      ref_down_on_mask.current = false;
    }
  }
  return (status === State.closed && !forceRender) ? <></> : (
    <div
      className={_className}
      onPointerDown={onPointerDown}
      onPointerUp={onPointerUp}
      onClick={e => e.stopPropagation()}
      tabIndex={-1}
      ref={ref}
      {..._p}>
      {typeof children === 'function' ? children(props) : children}
    </div>
  )
}

export interface IMaskProps extends Omit<IBackgroundProps, 'children'> {
  container?: HTMLElement | (() => HTMLElement);
  children?: ((p: IMaskProps) => React.ReactNode) | React.ReactNode | undefined;
}

export function Mask(props: IMaskProps) {
  const { container, children, ...remain_props } = props;
  const _container = (!container) ? document.body : (typeof container === 'function') ? container() : container
  return createPortal(<Background {...remain_props}>{typeof children === 'function' ? children(props) : children}</Background>, _container)
}
