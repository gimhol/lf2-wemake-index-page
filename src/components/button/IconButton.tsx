import { open_link } from "@/utils/open_link";
import classnames from "classnames";
import csses from "./IconButton.module.scss";
import type { ReactNode } from "react";

export interface IIconButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  __keep?: unknown;
  href?: string;
  gone?: unknown;

  img?: string;
  alt?: string;

  letter?: string;

  icon?: ReactNode;

  stopPropagation?: boolean;
  size?: number;
}
export function IconButton(props: IIconButtonProps) {
  const { className, href, onClick, icon, children, size = 20, gone, img, title, alt = title, letter, stopPropagation, ..._p } = props;
  const _on_click: typeof onClick = (e) => {
    if (stopPropagation) e.stopPropagation();
    onClick?.(e);
    open_link(href);
    e.stopPropagation();
  }
  if (gone) return <></>;

  const cls_root = classnames(csses.icon_button, className)
  return (
    <button className={cls_root} onClick={_on_click} title={title}{..._p} >
      {img ? <img src={img} width={size} draggable={false} alt={alt} /> : null}
      {icon}
      {letter ? <span className={csses.letter}>{letter}</span> : null}
      {children}
      {href ? <a href={href} className={csses.icon_button_href} /> : null}
    </button>
  )
}

