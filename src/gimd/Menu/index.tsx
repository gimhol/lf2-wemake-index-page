import classNames from "classnames";
import React, { useEffect, useMemo, useRef, useState } from "react";
import Button, { type IButtonProps } from "../Button";
import { useEventListener } from "../hooks/useEventListener";
import { type IMaskProps, Mask } from "../Mask";
import styles from './index.module.scss';
export interface IMenuItem extends IButtonProps {
  key?: React.Key
}
export interface IMenuProps extends Omit<IMaskProps, 'children'> {
  x?: number;
  y?: number;
  items?: IMenuItem[];
  size?: IButtonProps['size'];
  anchorX?: number,
  anchorY?: number,
}
const empty_items: IMenuItem[] = [];
export default function Menu(props: IMenuProps) {
  const { items = empty_items,
    forceRender = false,
    transparent = true,
    clickable = false,
    anchorX = 0,
    anchorY = 0,
    open, onClose, x, y, size = 'm',
    ..._p
  } = props;
  const [_open, _set_open] = useState(props.open);
  const is_open = open ?? _open;
  const ref_x_y = useRef<[number, number]>([0, 0]);
  const ref_origin = useRef([anchorX, anchorY] as const);
  ref_origin.current = [anchorX, anchorY] as const;

  useMemo(() => {
    if (typeof x !== 'number' || typeof y !== 'number') return;
    ref_x_y.current[0] = x
    ref_x_y.current[1] = y
  }, [x, y])

  const ref_menu = useRef<HTMLDivElement | null>(null);
  const follow = () => {
    const menu = ref_menu.current
    if (!menu) return;
    const ox = ref_origin.current[0];
    const oy = ref_origin.current[1];
    const x = ref_x_y.current[0];
    const y = ref_x_y.current[1];
    const { width, height } = menu.getBoundingClientRect();
    const l = Math.floor(Math.max(0, x - width * ox))
    const t = Math.floor(Math.max(0, y - height * oy))
    menu.style.left = `${l}px`;
    menu.style.top = `${t}px`;

    
  }

  useEventListener(window, 'pointerdown', () => {
    if (onClose) onClose()
    else _set_open(false)
  }, void 0, is_open);

  useEventListener(window, 'pointerdown', e => {
    ref_x_y.current = [5 + e.pageX, 5 + e.pageY];
    follow();
  }, void 0, (x === void 0 && y === void 0));

  const ref_resize_ob = useMemo(() => new ResizeObserver(() => follow()), [])

  useEffect(() => {
    if (is_open) follow();
  }, [is_open])

  const menu_classname = classNames(styles.menu)
  const on_menu_ref = (r: HTMLDivElement | null) => {
    if (ref_menu.current) ref_resize_ob.unobserve(ref_menu.current)
    if (r) ref_resize_ob.observe(ref_menu.current = r)
    if (r) follow()
  }
  return (
    <Mask
      transparent={transparent}
      clickable={clickable}
      open={is_open}
      forceRender={forceRender}
      {..._p}>
      <div className={menu_classname} ref={on_menu_ref}>
        {items.map((info, idx) => {
          const { className, key, ..._p } = info;
          const classname = classNames(styles.menu_item, className)
          return (
            <Button  {..._p} key={info.key ?? idx ?? key} kind='normal' size={size} className={classname} />
          )
        })}
      </div>
    </Mask>
  )
}
