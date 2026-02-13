import { Tooltip, type ITooltipProps } from "@/gimd/Tooltip";
import { open_link } from "@/utils/open_link";
import classnames from "classnames";
import type { ReactNode } from "react";
import csses from "./IconButton.module.scss";

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
  container?: ITooltipProps['container']
}
export function IconButton(props: IIconButtonProps) {
  const { container, className, href, onClick, icon, children, size = 20, gone, img, title, alt = title, letter, stopPropagation, ..._p } = props;
  const _on_click: typeof onClick = (e) => {
    if (stopPropagation) e.stopPropagation();
    onClick?.(e);
    open_link(href);
    e.stopPropagation();
  }
  if (gone) return <></>;

  const cls_root = classnames(csses.icon_button, children ? null : csses.no_children, className)
  return (
    <Tooltip title={title} container={container}>
      <button className={cls_root} onClick={_on_click} data-title={title} {..._p} >
        {img ? <img src={img} width={size} draggable={false} alt={alt} /> : null}
        {icon}
        {letter ? <span className={csses.letter}>{letter}</span> : null}
        {children}
        {href ? <a href={href} className={csses.icon_button_href} /> : null}
      </button>
    </Tooltip>
  )
}

