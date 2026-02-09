import _classnames from "classnames";
import React, { type ForwardedRef, forwardRef, useMemo } from "react";
import type { SizeType } from "../SizeEnum";
import _styles from "./styles.module.scss";
export type TextTag = 'span' | 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6'
export type TextType = 'secondary' | 'default' | 'link'
export interface TextProps extends React.HTMLAttributes<HTMLElement> {
  type?: TextType;
  size?: SizeType;
  delete?: boolean;
  disabled?: boolean;
  no_wrap?: boolean;
  tag?: TextTag;
}
export const Text = forwardRef<HTMLElement, TextProps>(
  (props: TextProps, ref: ForwardedRef<HTMLElement>) => {
    const {
      type = 'default',
      className,
      delete: _delete = false,
      disabled,
      size = 'm',
      no_wrap = true,
      tag = 'span',
      ..._p
    } = props;

    const _classname = useMemo(() => _classnames(
      _styles.text,
      _styles[`text_${type}`],
      _styles[`${tag}_text_size_${size}`],
      _styles[`${tag}_text_line_height_${size}`], {
      [_styles.text_delete_line]: _delete,
      [_styles.text_no_wrap]: no_wrap,
      [_styles.text_disabled]: disabled
    }, className
    ), [type, tag, size, _delete, no_wrap, disabled, className])

    return React.createElement(tag, { ..._p, className: _classname, ref })
  }
)