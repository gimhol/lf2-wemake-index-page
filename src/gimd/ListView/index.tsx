import { useMemo } from "react"
import { ScrollView, type IScrollViewProps } from "../ScrollView"
import styles from "./styles.module.scss"
import classNames from "classnames";
import React from "react";

export interface IListViewProps<D> extends Omit<IScrollViewProps, 'horizontal'> {
  items?: D[];
  item_key?(item: D): React.Key;
  render_item?: (data: D, index: number, items: D[]) => React.ReactNode;
}
export function ListView<D>(props: IListViewProps<D>): React.ReactElement {
  const { items, render_item: render_items, item_key, classnames, vertical = true, children, ..._p } = props;

  const _children = useMemo(() => {
    if (!render_items) return void 0;
    if (!items) return void 0;
    return items?.map((a, b, c) => <React.Fragment key={item_key ? item_key(a) : b}>{render_items(a, b, c)}</React.Fragment>)
  }, [item_key, items, render_items])

  const _classnames = useMemo(() => {
    const styles_direction = vertical ? styles.vertical : styles.horizontal
    return {
      root: classNames(styles.list_view, styles_direction, classnames?.root),
      viewport: classNames(styles.viewport, styles_direction, classnames?.viewport),
      content: classNames(styles.content, styles_direction, classnames?.content)
    }
  }, [classnames, vertical])

  return (
    <ScrollView
      classnames={_classnames}
      vertical={vertical}
      horizontal={!vertical}
      {..._p}>
      {_children}
      {children}
    </ScrollView>
  )
}
