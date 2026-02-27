import Show from "@/gimd/Show";
import cns from "classnames";
import csses from "./styles.module.scss";
export interface INavButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  show?: boolean;
  actived?: boolean;
}
export function NavButton(props: INavButtonProps) {
  const { show, actived, className, ..._p } = props;
  const cls_name = cns(actived ? csses.game_item_actived : csses.game_item, className)
  return (
    <Show yes={'show' in props ? !!(show) : true}>
      <button className={cls_name} {..._p} />
    </Show>
  )
}