/* eslint-disable react-hooks/refs */
/* eslint-disable react-hooks/set-state-in-effect */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { interrupt_event } from "@/utils/interrupt_event";
import { usePropState } from "@/utils/usePropState";
import classnames from "classnames";
import { cloneElement, isValidElement, useEffect, useMemo, useRef, useState, type CSSProperties, type HTMLAttributes, type PointerEventHandler, type PropsWithChildren, type ReactNode } from "react";
import { createPortal } from "react-dom";
import csses from "./index.module.scss";
import { useToggleStatus } from "./useToggleStatus";

export interface ITooltipProps extends PropsWithChildren {
  _?: never;
  title?: ReactNode;
  open?: boolean;
  onOpen?(v?: boolean): void;
  container?: Element | DocumentFragment | (() => Element | DocumentFragment);
  style?: CSSProperties;
}
export function Tooltip(props: ITooltipProps) {
  const { children, title, open: _open, container = document.body, style: _style, onOpen } = props;
  const [open, set_open] = usePropState(_open, onOpen);
  const [style, set_style] = useState<CSSProperties>({});
  const [viewing, set_viewing] = useState(false)
  const [pinned, set_pinned] = useState(false);
  const ref_tid = useRef(0)
  const [alt, set_alt] = useState(false)

  useEffect(() => {
    const keydown = (e: KeyboardEvent) => {
      const k = e.key?.toLowerCase()
      if (k != 'alt' && k != 'escape') return
      e.preventDefault()
      e.stopPropagation()
      if (k == 'escape') set_viewing(false)
      if (k == 'alt') set_alt(true)
    }
    const keyup = (e: KeyboardEvent) => {
      const k = e.key?.toLowerCase()
      if (k != 'alt' && k != 'escape') return
      e.preventDefault()
      e.stopPropagation()
      if (k == 'escape') set_viewing(false)
      if (k == 'alt') set_alt(false)
    }
    window.addEventListener('keydown', keydown)
    window.addEventListener('keyup', keyup)
    return () => {
      window.removeEventListener('keydown', keydown)
      window.removeEventListener('keyup', keyup)
    }
  }, [])

  const _children = useMemo(() => {
    if (!title) return children;
    const {
      onPointerEnter, onPointerLeave, ...r_props
    } = isValidElement<any>(children) ? children.props : {} as any
    const _onPointerEnter: PointerEventHandler<any> = e => {
      const rect = (e.target as HTMLElement).getBoundingClientRect();
      const ih = window.innerHeight
      const iw = window.innerWidth
      const s: CSSProperties = {}
      if (rect.right <= iw / 2) s.left = rect.left
      else s.right = `calc(100vW - ${rect.right}px)`
      if (rect.bottom <= ih / 2) s.top = rect.bottom
      else s.bottom = `calc(100vh - ${rect.top}px)`
      set_style(s)
      set_open(true)
      clearTimeout(ref_tid.current)
      return onPointerEnter?.(e)
    }
    const _onPointerLeave: PointerEventHandler<any> = e => {
      clearTimeout(ref_tid.current)
      ref_tid.current = setTimeout(() => {
        set_viewing(false);
        set_open(false)
      }, 300)
      return onPointerLeave?.(e)
    }
    const new_props: HTMLAttributes<any> = {
      ...r_props,
      onPointerEnter: _onPointerEnter,
      onPointerLeave: _onPointerLeave
    }
    if (isValidElement<any>(children)) {
      return cloneElement(children, new_props)
    } else {
      return <span {...new_props}>{children}</span>
    }
  }, [children, set_open, title])

  const [gone, status] = useToggleStatus(pinned || open || viewing, [300, 300]);
  const cls = classnames(csses.tooltip, pinned && csses.pinned, status === 'opening' ? csses.open : void 0);
  return <>
    {_children}
    {
      gone ? null : createPortal(<div
        className={cls}
        style={{ pointerEvents: alt || pinned ? 'none' : void 0, ...style, ..._style }}
        draggable={false}
        onDragStart={e => e.preventDefault()}
        onPointerEnter={e => {
          interrupt_event(e)
          clearTimeout(ref_tid.current)
          set_viewing(true)
        }}
        onPointerLeave={e => {
          interrupt_event(e)
          clearTimeout(ref_tid.current)
          ref_tid.current = setTimeout(() => {
            set_open(false);
            set_viewing(false);
          }, 300)
        }}>
        {
          (alt || pinned) ?
            <button className={pinned ? csses.pin_btn_active : csses.pin_btn} onClick={() => set_pinned(!pinned)}>
              📌
            </button> : null
        }

        {title}
      </div>, typeof container === 'function' ? container() : container)
    }
  </>

}