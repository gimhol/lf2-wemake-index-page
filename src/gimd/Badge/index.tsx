import cns from "classnames";
import React, { useMemo } from "react";
import { type SizeType } from "../SizeEnum";
import styles from "./style.module.scss";
export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  label?: React.ReactNode;
  size?: SizeType;
  color?: string;
}
export function Badge(props: BadgeProps) {
  const { 
    label, children = label, size = 's', className, style, 
    color = style?.backgroundColor, ..._p 
  } = props;
  
  const _class_name = useMemo(() => cns(styles.badge, styles[`badge_size_${size}`], className), [className, size])

  return (
    <span
      {..._p}
      className={_class_name}
      style={{
        ...style,
        backgroundColor: color ?? style?.backgroundColor,
      }}>
      {children}
    </span>
  )
}