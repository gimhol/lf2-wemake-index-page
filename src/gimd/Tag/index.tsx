import classNames from "classnames";
import Button from "../Button";
import Show from "../Show";
import type { SizeType } from "../SizeEnum";
import { Text, type TextProps } from "../Text";
import _styles from "./style.module.scss";
import { Flex } from "../Flex";
import { useMemo } from "react";

export interface ITagProps extends Omit<React.HTMLAttributes<HTMLSpanElement>, 'prefix'> {
  size?: SizeType;
  closable?: boolean;
  onClose?(e: React.MouseEvent | KeyboardEvent): void;
  disabled?: boolean;
  inner?: React.ReactNode,
  prefix?: React.ReactNode,
  suffix?: React.ReactNode,
  type?: TextProps['type']
}
export function Tag(props: ITagProps) {
  const {
    disabled,
    className,
    closable = false,
    size = 's',
    onClose,
    children,
    prefix,
    suffix,
    inner,
    type,
    ..._p
  } = props;

  const _classNames = useMemo(() => classNames(
    _styles.tag,
    {
      [_styles.closable]: closable
    },
    size,
    className
  ), [className, closable, size])

  return (
    <Flex {..._p} className={_classNames} inline alignItems='center' gap={1}>
      {prefix}
      {inner}
      <Show yes={!inner}>
        <Text size={size} disabled={disabled} type={type} >
          {children}
        </Text>
      </Show>
      <Show yes={closable}>
        <Button size={size} disabled={disabled} kind='icon' onClick={onClose}>
          ×
        </Button>
      </Show>
      {suffix}
    </Flex>
  )
}