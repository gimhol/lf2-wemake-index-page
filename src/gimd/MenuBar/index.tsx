/* eslint-disable @typescript-eslint/no-unused-vars */
import classNames from "classnames";
import { type IButtonProps } from "../Button";
import { built_in_item_render } from "./built_in_item_render";
import styles from './style.module.scss';

export interface IMenuBarItem extends Omit<IButtonProps, 'children'> {
  label?: React.ReactNode;
}
export interface IMenuBarProps extends React.HTMLAttributes<HTMLDivElement> {
  items?: IMenuBarItem[]
}

export default function MenuBar(props: IMenuBarProps) {
  const { className, items, ...remainProps } = props
  return (
    <div className={classNames(styles.top_bar, className)} {...remainProps}>
      {items?.map(built_in_item_render)}
    </div>
  )
}