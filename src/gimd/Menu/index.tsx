import { usePropState } from "@/utils/usePropState";
import classNames from "classnames";
import React, { useCallback, useEffect, useRef } from "react";
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
  onXChange?(v: number): void,
  onYChange?(v: number): void,
}
const empty_items: IMenuItem[] = [];
export default function Menu(props: IMenuProps) {
  const { items = empty_items,
    forceRender = false,
    transparent = true,
    clickable = false,
    anchorX = 0,
    anchorY = 0,
    open: __open, onChange,
    x: __x, onXChange,
    y: __y, onYChange,
    size = 'm',
    ..._p
  } = props;

  const [open, set_open] = usePropState(__open, onChange);
  const [x, set_x] = usePropState(__x, onXChange);
  const [y, set_y] = usePropState(__y, onYChange);
  const ref_origin = useRef<[number, number]>([anchorX, anchorY]);
  const ref_menu = useRef<HTMLDivElement | null>(null);
  const follow = useCallback(() => {
    const menu = ref_menu.current
    if (!menu) return;
    const ox = ref_origin.current[0];
    const oy = ref_origin.current[1];
    const { width, height } = menu.getBoundingClientRect();
    const l = Math.floor(Math.max(0, (x ?? 0) - width * ox))
    const t = Math.floor(Math.max(0, (y ?? 0) - height * oy))
    menu.style.left = `${l}px`;
    menu.style.top = `${t}px`;
  }, [x, y]);

  useEventListener(window, 'pointerdown', () => {
    if (onChange) onChange()
    else set_open(false)
  }, void 0, open);

  useEventListener(window, 'pointerdown', e => {
    set_x(5 + e.pageX)
    set_y(5 + e.pageY)
    follow();
  }, void 0, (__x === void 0 && __y === void 0));

  useEffect(() => {
    if (!open) return;
    const ob = new ResizeObserver(() => follow());
    const tid = setInterval(() => {
      const el_menu = ref_menu.current;
      if (!el_menu) return;
      ob.observe(el_menu);
      follow();
      clearInterval(tid)
    }, 1)
    return () => {
      ob.disconnect();
      clearInterval(tid)
    }
  }, [follow, open])

  const menu_classname = classNames(styles.menu)
  return (
    <Mask
      transparent={transparent}
      clickable={clickable}
      open={open}
      forceRender={forceRender}
      {..._p}>

      <div className={menu_classname} ref={ref_menu}>
        {items.map((info, idx) => {
          const { className, key, ..._p } = info;
          const classname = classNames(styles.menu_item, className)
          return (
            <Button
              {..._p}
              key={info.key ?? idx ?? key}
              kind='normal'
              size={size}
              className={classname} />
          )
        })}
      </div>
      <div style={{ display: 'none' }} ref={() => { follow() }} />
    </Mask>
  )
}
