import React, { useMemo } from "react";
import _styles from "./style.module.scss";
import _classnames from "classnames";
import { useMidRef } from "../helper/useMidRef";

export interface IFlexProps extends React.HTMLAttributes<HTMLElement> {
  inline?: boolean;
  alignItems?: React.CSSProperties['alignItems'];
  justifyContent?: React.CSSProperties['justifyContent'];
  gap?: React.CSSProperties['gap'];
  vertical?: boolean;
  wrap?: React.CSSProperties['flexWrap'];
  _ref?: React.Ref<HTMLDivElement>;
}

export function Flex(props: IFlexProps) {
  const {
    className,
    inline,
    alignItems,
    justifyContent,
    style,
    gap,
    vertical = false,
    wrap,
    _ref,
    ..._p
  } = props;

  const [, on_ref] = useMidRef(_ref);
  const _root_classname = _classnames(
    _styles.flex, {
    [_styles.inline]: inline
  }, className);

  const _style = useMemo(() => {
    const ret: React.CSSProperties = {
      alignItems,
      justifyContent,
      gap,
      flexWrap: wrap,
      flexDirection: vertical ? 'column' : 'row',
      ...style,
    }
    return ret;
  }, [alignItems, justifyContent, gap, style, wrap, vertical])



  return <div {..._p} className={_root_classname} style={_style} ref={on_ref} />
}