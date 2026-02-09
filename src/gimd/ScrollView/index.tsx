import { ScrollBar } from "@/ScrollBar";
import classNames from "classnames";
import React, { useEffect, useRef } from "react";
import styles from "./styles.module.scss";

export interface IScrollViewProps extends React.HTMLAttributes<HTMLDivElement> {
  classnames?: { root?: string, viewport?: string, content?: string },
  vertical?: boolean;
  horizontal?: boolean;
}
export function ScrollView(props: IScrollViewProps): React.ReactElement {
  const { children, className, classnames, horizontal = true, vertical = true, ..._p } = props;
  const ref_ele_scrollview = useRef<HTMLDivElement | null>(null);
  const ref_ele_viewport = useRef<HTMLDivElement | null>(null);
  const ref_ele_content = useRef<HTMLDivElement | null>(null);
  useEffect(() => {
    const scrollview = ref_ele_scrollview.current;
    const viewport = ref_ele_viewport.current;
    const content = ref_ele_content.current;
    if (!scrollview || !viewport || !content) return;
    const vsb = vertical ? new ScrollBar({
      container: scrollview, target: viewport, inner: content, direction: 'vertical'
    }) : void 0;
    const hsb = horizontal ? new ScrollBar({
      container: scrollview, target: viewport, inner: content, direction: 'horizontal'
    }) : void 0;
    return () => { vsb?.release(); hsb?.release() }
  }, [vertical, horizontal])

  return (
    <div className={classNames(styles.scrollview, classnames?.root, className)} ref={ref_ele_scrollview} {..._p}>
      <div className={classNames(styles.viewport, classnames?.viewport)} ref={ref_ele_viewport}>
        <div className={classNames(styles.content, classnames?.content)} ref={ref_ele_content}>
          {children}
        </div>
      </div>
    </div>
  )
}