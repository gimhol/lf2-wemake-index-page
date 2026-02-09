import classnames from 'classnames';
import { useMemo } from 'react';
import Button, { type IButtonProps } from '../Button';
import Show from '../Show';
import styles from './style.module.scss';
export interface IOnChangedArg {
  current: number,
  pageSize: number,
}
export interface IGetButtonPropsArg {
  current?: number,
  pageSize: number,
  total: number,
  index: number,
}
export interface IPaginationProps {
  current?: number,
  total: number,
  pageSize: number,
  onChanged?: (v: IOnChangedArg) => void,
  getButtonProps?(v: IGetButtonPropsArg): IButtonProps
}
export default function Pagination(props: IPaginationProps) {
  const { total, pageSize, current, onChanged, getButtonProps } = props;
  const children = useMemo(() => {
    const children: React.ReactNode[] = [];
    const count = total / pageSize;
    for (let i = 0; i < count; ++i) {
      const {
        className: o_className,
        style: o_style,
        ...override_props
      } = getButtonProps ? getButtonProps({
        current,
        pageSize,
        total,
        index: i,
      }) : {}
      const className = classnames(
        styles.btn_page,
        i === current && styles.btn_page_current,
        o_className
      )
      const on_click = () => onChanged?.({ current: i, pageSize })
      children.push(
        <Button
          key={i}
          size='s'
          className={className}
          style={{ width: 25, height: 25, ...o_style }}
          onClick={on_click}
          {...override_props}>
          {i + 1}
        </Button>
      );
    }
    return children;
  }, [onChanged, pageSize, total, current, getButtonProps]);

  return (
    <Show yes={total > pageSize}>
      <div className={styles.pagination}>
        {children}
      </div>
    </Show>
  );
}
