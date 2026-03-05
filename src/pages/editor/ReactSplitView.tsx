import cns from "classnames";
import React, { useEffect, useRef, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";
import csses from "./index.module.scss";
import { SplitView } from "./SplitView";
export interface IReactSplitViewProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'children'> {
  direction?: "h" | "v";
  children?(leaf: SplitView): ReactNode;
}

export function ReactSplitView(props: IReactSplitViewProps) {
  const { children, direction = 'h', className, ..._p } = props;

  const ref_container = useRef<HTMLDivElement>(null);
  const [root, set_root] = useState(() => new SplitView(direction))
  const [leaves, set_leaves] = useState<SplitView[]>([])

  useEffect(() => {
    // eslint-disable-next-line react-hooks/immutability
    root.handle_leaves = set_leaves
  }, [children, root])

  useEffect(() => {
    const el_container = ref_container.current;
    if (!el_container) return;

    const split_view = new SplitView(direction)
    set_root(split_view)
    el_container.append(split_view.node);
    const root_top = split_view.insert();
    root_top.data = 'root_top';
    root_top.mode = 'fixed';
    root_top.size = 22;

    const root_mid = split_view.insert();
    root_mid.data = 'root_mid'
    root_mid.size = 500;

    const second_view = root_mid.insert();
    second_view.data = 'second_view';
    second_view.mode = 'keep';
    second_view.size = 220;

    const main_view = root_mid.insert();
    main_view.data = 'main_view'
    main_view.size = el_container.getBoundingClientRect().width - 220

    const root_bottom = split_view.insert();
    root_bottom.data = 'root_bottom';
    root_bottom.mode = 'fixed';
    root_bottom.size = 22;

    split_view.handle_leaves = set_leaves;
    set_leaves(split_view.leaves());
    split_view.update()

    const resize_ob = new ResizeObserver(() => {
      split_view.update();
    });
    resize_ob.observe(el_container)

    Object.assign(window, { split_view })
    return () => {
      split_view.release();
      resize_ob.disconnect();
    }
  }, [])

  return <>
    <div
      className={cns(csses.split_view_container, className)}
      ref={ref_container}
      {..._p}
    />
    {leaves.map(leaf => createPortal(children?.(leaf), leaf.view_container, leaf.id))}
  </>
}