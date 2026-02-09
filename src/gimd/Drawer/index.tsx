import { ScrollBar } from "@/ScrollBar";
import classnames from "classnames";
import { useCallback, useEffect, useRef, useState } from "react";
import styles from './style.module.scss';

export interface IDrawerProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'onChange'> {
  open?: boolean;
  onChange?(open: boolean): void;
  closeWidth?: number;
  openWidth?: number;
  defaultWidth?: number;
  pos?: 'l' | 'r';
  className?: string;
}
export function Drawer(props: IDrawerProps) {
  const {
    open = true,
    onChange,
    children,
    pos = 'l',
    closeWidth = 30,
    openWidth = 250,
    defaultWidth = 250,
    className,
    style, ..._p
  } = props;

  const [_inner_open, _set_inner_open] = useState<boolean | undefined>();
  const _open = open ?? _inner_open;

  const ref_set_open = useRef(onChange ?? _set_inner_open)
  ref_set_open.current = onChange ?? _set_inner_open;

  const ref_width = useRef(defaultWidth);
  const [width, setWidth] = useState(_open ? ref_width.current : 0);
  const [resizing, setResizing] = useState(false);
  const ref_ele = useRef<HTMLDivElement>(null);
  const ref_offset_x = useRef(0);

  const ref_closeWidth = useRef(closeWidth);
  ref_closeWidth.current = closeWidth
  const ref_openWidth = useRef(openWidth);
  ref_openWidth.current = openWidth

  useEffect(() => {
    setWidth(_open ? Math.max(
      ref_width.current,
      ref_closeWidth.current,
      ref_openWidth.current
    ) : 0);
  }, [_open]);

  const get_ele_width = () => {
    const ele = ref_ele.current!;
    const { borderLeftWidth: blw, borderRightWidth: brw } = getComputedStyle(ele);
    return parseInt(blw) + parseInt(brw) + ele.clientWidth
  }

  const on_pointermove = useCallback((e: PointerEvent) => {
    const ele = ref_ele.current!;
    if (pos === 'l') {
      const w = Math.max(5, e.clientX - ele.offsetLeft + ref_offset_x.current);
      ele.style.width = (ref_width.current = w) + 'px';
    } else {
      const w = Math.max(5, e.clientX - (ele.offsetLeft + ele.clientWidth) - ref_offset_x.current);
      ele.style.width = (ref_width.current = w) + 'px';
    }
  }, [pos]);

  const on_pointerup = useCallback(() => {
    console.log('on_pointerup')
    const ele = ref_ele.current;
    if (!ele) return;
    ele.classList.remove(styles.drawer_dragging)
    document.removeEventListener('pointermove', on_pointermove);
    document.removeEventListener('pointerup', on_pointerup);
    window.removeEventListener('blur', on_pointerup);
    setWidth(get_ele_width());
    setResizing(false);
    if (ele.clientWidth < closeWidth) ref_set_open.current(false)
  }, [on_pointermove, closeWidth]);

  const on_pointerdown = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    const ele = e.target as HTMLDivElement;
    ref_width.current = get_ele_width();
    setResizing(true);
    ref_offset_x.current = ele.clientWidth - e.nativeEvent.offsetX;
    ref_ele.current?.classList.add(styles.drawer_dragging)
    e.stopPropagation();
    e.preventDefault();
    document.addEventListener('pointermove', on_pointermove);
    document.addEventListener('pointerup', on_pointerup);
    window.addEventListener('blur', on_pointerup);
  }, [on_pointermove, on_pointerup]);

  useEffect(() => on_pointerup, [on_pointermove, on_pointerup]);
  const ref_inner = useRef<HTMLDivElement>(null)
  useEffect(() => {
    const ele = ref_inner.current;
    if (!ele) return;
    const vsb = new ScrollBar({
      target: ele,
      direction: 'vertical',
      container: ele.parentElement!,
      inner: ele.firstElementChild!,
      styles: { scroll_bar: { base: { marginRight: '3px' } } },
      // __debug: (...args) => console.log(...args)
    })
    const hsb = new ScrollBar({
      target: ele,
      direction: 'horizontal',
      container: ele.parentElement!,
      inner: ele.firstElementChild!,
    })
    return () => {
      vsb.release();
      hsb.release();
    }
  }, [ref_inner])
  return (
    <div
      ref={ref_ele}
      className={classnames(styles.drawer, { [styles.drawer_close]: !_open }, className)}
      style={{ width: resizing ? ref_width.current : width, ...style }}
      {..._p}>
      <div ref={ref_inner} className={classnames(styles.drawer_inner, { [styles.drawer_inner_close]: !_open })}>
        {children}
      </div>
      <Resizer
        pos={pos}
        resizing={resizing}
        onPointerDown={on_pointerdown}
        open={_open} />
    </div>
  );
}

interface ResizerProps extends React.HTMLAttributes<HTMLDivElement> {
  pos?: 'l' | 'r';
  resizing?: boolean;
  open?: boolean;
}
function Resizer(props: ResizerProps) {
  const { pos, resizing, open, ..._p } = props
  const className = classnames(
    styles.resizer,
    {
      [styles.resizer_close]: !open,
      [styles.resizer_actived]: resizing,
      [styles.l_resizer]: pos === 'r',
      [styles.r_resizer]: pos === 'l',
    }
  )
  return (
    <div
      className={className}
      tabIndex={-1}
      {..._p} />
  )
}