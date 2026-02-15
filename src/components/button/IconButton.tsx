import { Tooltip, type ITooltipProps } from "@/gimd/Tooltip";
import { open_link } from "@/utils/open_link";
import classnames from "classnames";
import { useMemo, type ReactNode } from "react";
import csses from "./IconButton.module.scss";

export interface IIconButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  __keep?: unknown;
  href?: string;
  gone?: unknown;
  icon?: ReactNode;
  stopPropagation?: boolean;
  size?: number;
  container?: ITooltipProps['container']
}
export function IconButton(props: IIconButtonProps) {
  const { container, className, href, onClick, icon, children, size = 20, gone, title, stopPropagation, ..._p } = props;
  const _on_click: typeof onClick = (e) => {
    if (stopPropagation) e.stopPropagation();
    onClick?.(e);
    open_link(href);
    e.stopPropagation();
  }

  const cls_root = classnames(csses.icon_button, children ? null : csses.no_children, className);

  const icon_type = useMemo(() => {
    if (typeof icon !== 'string') return 'custom';
    const unsure = icon.trim()
    if (!unsure) return null;
    if (unsure.length > 2) return 'img'
    return 'letter'
  }, [icon])

  return gone ? <></> : (
    <Tooltip title={title} container={container} >
      <button className={cls_root} onClick={_on_click} data-icon={icon} data-title={title} {..._p} >
        {icon_type == 'img' && <img className={csses.icon_img} src={icon as string} width={size} draggable={false} alt={title} />}
        {icon_type == 'letter' && <span className={csses.letter}>{icon as string}</span>}
        {icon_type == 'custom' && icon}
        {children}
        {href ? <a href={href} className={csses.icon_button_href} /> : null}
      </button>
    </Tooltip>
  )
}

