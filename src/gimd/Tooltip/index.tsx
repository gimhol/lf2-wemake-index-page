/* eslint-disable react-hooks/set-state-in-effect */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { usePropState } from "@/utils/usePropState";
import classnames from "classnames";
import { cloneElement, isValidElement, useMemo, useState, type CSSProperties, type HTMLAttributes, type PropsWithChildren, type ReactNode } from "react";
import csses from "./index.module.scss";
import { useToggleStatus } from "./useToggleStatus";
import { interrupt_event } from "@/utils/interrupt_event";
import { createPortal } from "react-dom";

export interface ITooltipProps extends PropsWithChildren {
  _?: never;
  title?: ReactNode;
  open?: boolean;
  onOpen?(v?: boolean): void;
  container?: Element | DocumentFragment | (() => Element | DocumentFragment)
}
export function Tooltip(props: ITooltipProps) {
  const { children, title, open: _open, container = document.body, onOpen } = props;
  const [open, set_open] = usePropState(_open, onOpen);
  const [style, set_style] = useState<CSSProperties>({});
  const [viewing, set_viewing] = useState(false)
  const _children = useMemo(() => {
    if (title && isValidElement<any>(children)) {
      const {
        onPointerEnter,
        onPointerLeave,
        ...props
      } = (children.props || {}) as HTMLAttributes<any>;
      const new_props: HTMLAttributes<any> = {
        ...props,
        onPointerEnter: e => {
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
          return onPointerEnter?.(e)
        },
        onPointerLeave: e => {
          set_open(false)
          return onPointerLeave?.(e)
        }
      }
      return cloneElement(children, new_props)
    } else {
      return children
    }
  }, [children, set_open, title])

  const [gone, status] = useToggleStatus(open || viewing, [300, 300])
  const cls = classnames(csses.tooltip, status === 'opening' ? csses.open : void 0)
  return <>
    {_children}
    {
      gone ? null : createPortal(<div
        className={cls}
        style={style}
        draggable={false}
        onDragStart={e => e.preventDefault()}
        onPointerEnter={e => {
          interrupt_event(e)
          set_viewing(true)
        }}
        onPointerLeave={e => {
          interrupt_event(e)
          set_viewing(false)
        }}>
        {title}
      </div>, typeof container === 'function' ? container() : container)
    }
  </>

}