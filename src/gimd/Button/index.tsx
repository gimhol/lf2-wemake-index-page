import classnames from 'classnames';
import devices from 'current-device';
import { useMemo } from 'react';
import useShortcut, { type TShortcutCombines } from '../hooks/useShortcut';
import Anchor from '../SEO/Anchor';
import Show from '../Show';
import { SizeEnum, type SizeType } from '../SizeEnum';
import { Text } from '../Text';
import styles from './style.module.scss';

export interface IButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  kind?: 'underline' | 'icon' | 'normal';
  shortcut_key?: string;
  shortcut?: TShortcutCombines;
  onClick?: (e: React.MouseEvent | KeyboardEvent) => void;
  show_shrotcut?: boolean;
  open?: string;
  href?: string;
  size?: SizeType;
  delete?: boolean;
  auto_space?: boolean;
  no_jump?: boolean;
}
export default function Button(props: IButtonProps) {
  const {
    className,
    kind = 'underline',
    shortcut = '',
    onClick,
    disabled,
    children,
    open,
    href,
    type = 'button',
    size = SizeEnum.Middle,
    show_shrotcut = (kind !== 'icon' && devices.desktop()),
    delete: _delete = false,
    no_jump = false,
    ..._p
  } = props;

  const _on_click = (e: React.MouseEvent | KeyboardEvent) => {
    onClick?.(e);
    if (e.defaultPrevented || no_jump) return;
    if (open && typeof open === 'string') window.open(open);
    if (href && typeof href === 'string') document.location.href = href;
  }

  const [shortcut_str] = useShortcut(shortcut, _on_click, disabled || !shortcut)

  const _className = useMemo(() => {
    return classnames(
      styles.btn,
      styles[`btn_kind_${kind}`],
      styles[`btn_size_${size}`],
      {
        [styles.btn_delete_line]: _delete
      },
      className
    )
  }, [className, kind, size, _delete]);

  const shrotcut_visible = show_shrotcut && shortcut;
  return (
    <button className={_className} onClick={_on_click} disabled={disabled} type={type} {..._p} >
      <Anchor href={open || href} title={_p.title} />
      <Text className={styles.btn_inner} size={size} delete={_delete} disabled={disabled}>
        {children}{shrotcut_visible ? `(${shortcut_str})` : ''}
      </Text>
      <Show yes>
        <div className={styles.back_decorator} />
      </Show>
    </button>
  )
}

