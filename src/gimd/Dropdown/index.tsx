import { usePropState } from "@/utils/usePropState";
import devices from "current-device";
import React, { cloneElement, isValidElement, type PropsWithChildren, useMemo, useRef, useState } from "react";
import Button, { type IButtonProps } from "../Button";
import Menu, { type IMenuItem, type IMenuProps } from "../Menu";
const default_triggers = devices.desktop() ? ['hover'] : ['click'];
export type Trigger = 'hover' | 'click' | 'contextMenu'
export interface IOption<Value> extends Omit<IMenuItem, 'value'> {
  value?: Value;
  label?: React.ReactNode;
}

export interface DropdownProps extends PropsWithChildren {
  triggers?: Trigger[]
  menu?: IMenuProps;
  size?: IButtonProps['size'];
  open?: boolean;
  forceRender?: boolean;
  onChange?: React.Dispatch<React.SetStateAction<boolean>>;
  alignX?: number,
  alignY?: number,
  anchorX?: number,
  anchorY?: number,
  style?: React.CSSProperties,
}
export function Dropdown(props: DropdownProps) {
  const {
    triggers = default_triggers,
    menu,
    children,
    size = 'l',
    alignX = 0,
    alignY = 1,
    anchorX = 0,
    anchorY = 0,
    open: __open,
    onChange: __onChange,
    forceRender,
    style,
  } = props;
  const ref_open_reason = useRef<Trigger | undefined>(void 0)
  const [open, set_open] = usePropState(__open, __onChange)
  const [[x, y], set_x_y] = useState<[number, number]>(() => [0, 0])
  const ref_leave_inner_timer_id = useRef(0);
  let inner: React.ReactNode;

  if (isValidElement<React.HTMLAttributes<HTMLElement>>(children)) {
    const { props: { onPointerEnter, onClick, onContextMenu, onPointerLeave } } = children;
    const innper_props = { ...children.props }
    const fire = (trigger: Trigger, fn?: React.PointerEventHandler | React.MouseEventHandler<HTMLElement>) => (e: React.PointerEvent<HTMLElement>) => {
      fn?.(e)
      set_open((() => {
        if (!open) {
          const { x, y, width, height } = (e.target as HTMLElement).getBoundingClientRect()
          set_x_y([x + width * alignX, y + height * alignY])
          ref_open_reason.current = trigger
        }
        return !open
      })())
      window.clearTimeout(ref_leave_inner_timer_id.current)
      e.stopPropagation()
      e.preventDefault()
    }
    if (!triggers.length || triggers.indexOf('hover') >= 0) {
      innper_props.onPointerEnter = fire('hover', onPointerEnter)
      innper_props.onPointerLeave = e => {
        onPointerLeave?.(e);
        ref_leave_inner_timer_id.current = window.setTimeout(() => {
          set_open(false)
        }, 250)
      }
    }
    if (triggers.indexOf('click') >= 0)
      innper_props.onClick = fire('click', onClick)
    if (triggers.indexOf('contextMenu') >= 0)
      innper_props.onContextMenu = fire('contextMenu', onContextMenu)

    inner = cloneElement(children, innper_props);
  } else {
    inner = children;
  }
  return (
    <>
      {inner}
      <Menu
        x={x}
        y={y}
        anchorX={anchorX}
        anchorY={anchorY}
        onXChange={() => { }}
        onYChange={() => { }}
        size={size}
        style={style}
        onPointerEnter={() => {
          window.clearTimeout(ref_leave_inner_timer_id.current)
          ref_leave_inner_timer_id.current = 0;
        }}
        onPointerLeave={() => {
          if (ref_open_reason.current === 'hover') set_open(false)
        }}
        open={open}
        forceRender={forceRender}
        onChange={() => set_open(false)}
        {...menu}
      />
    </>
  )
}

export interface DropdownSelectProps<Value> extends Omit<DropdownProps, 'onChange'>, Omit<IButtonProps, 'open' | 'onChange' | 'value' | 'defaultValue'> {
  options?: IOption<Value>[],
  value?: Value;
  onChange?(v?: Value): void,
  defaultValue?: Value
}
Dropdown.Select = function Select<Value>(props: DropdownSelectProps<Value>) {
  const { menu, options, onChange, value, style, defaultValue, className, onPointerDown, ..._p } = props;

  const [_inner_value, _set_inner_value] = useState(defaultValue)
  const _value = 'value' in props ? value : _inner_value;

  const [real_menu] = useMemo(() => {
    const ret = { ...menu }
    if (!options?.length) return [ret];
    ret.items = options.map(v => {
      return {
        children: v.label ?? v.children,
        onClick: (e) => {
          v.onClick?.(e)
          onChange?.(v.value)
          _set_inner_value(v.value)
        }
      }
    })
    return [ret]
  }, [menu, options, onChange])

  const [selected_options] = useMemo(() => {
    if (!options) return [[{ value: _value, label: '' + _value }]] as const;
    return [[options.find(o => o.value === _value)]] as const
  }, [options, _value]);

  return (
    <Dropdown {..._p} menu={real_menu}>
      <Button style={style} className={className} onPointerDown={onPointerDown}>
        {selected_options.map(v => v?.label)}
      </Button>
    </Dropdown>
  )
}