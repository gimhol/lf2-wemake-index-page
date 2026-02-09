import React, { useMemo } from "react";
import { type SizeType } from "../SizeEnum";
import styles from "./style.module.scss"
import classNames from "classnames";
export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  label?: React.ReactNode;
  size?: SizeType;
  color?: string;
}
export function Badge(props: BadgeProps) {
  const { label, children = label, size = 's', className, style, color, ..._p } = props;
  const _class_name = useMemo(() => classNames(styles.badge, styles[`badge_size_${size}`], className), [className, size])

  const _style = useMemo(() => ({
    ...style,
    backgroundColor: color ?? style?.backgroundColor,
  }), [style, color]);

  return (
    <span
      {..._p}
      className={_class_name}
      style={_style}>
      {children}
    </span>
  )
}