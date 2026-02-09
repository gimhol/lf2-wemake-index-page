import Show from "@/gimd/Show";
import type { SizeType } from "@/gimd/SizeEnum";
import _classnames from "classnames";
import { isValidElement } from "react";
import _styles from "./style.module.scss";
export interface SpaceProps extends React.HTMLAttributes<HTMLDivElement> {
  align?: 'center' | 'left' | 'right';
  align_item?: 'start' | 'center' | 'end';
  vertical?: boolean;
  horizontal?: boolean;
  styles?: { item: React.CSSProperties }
  classnames?: { item: string }
  size?: SizeType;
  not_inline?: boolean;
  _ref?: React.Ref<HTMLDivElement>;
}

export function Space(props: SpaceProps) {
  const {
    align_item,
    align = 'center',
    className,
    children,
    styles,
    classnames,
    vertical,
    size = 'm',
    horizontal,
    not_inline = false,
    _ref,
    ..._p
  } = props;
  const _is_v = vertical === true && horizontal !== true;
  const _root_classname = _classnames(
    _styles.space,
    _styles[`space_align_${align}`],
    _styles[`space_size_${size}`],
    not_inline ? _styles.no_inline : void 0,
    _styles[_is_v ? 'space_v' : 'space_h'],
    align_item ? _styles[`space_align_items_${align_item}`] : void 0,
    className
  );
  const _item_classname = _classnames(
    _styles[_is_v ? 'space_item_v' : 'space_item_h'],
    classnames?.item
  );


  const render_item = (child: React.ReactNode, idx: number) => {
    if (null === child) return null;
    if (void 0 === child) return null;
    if (isValidElement(child) && Show.is(child) && !child.props.yes)
      return null;
    return (
      <div
        key={idx}
        className={_item_classname}
        style={styles?.item}>
        {child}
      </div>
    )
  }

  return (
    <div {..._p} ref={_ref} className={_root_classname}>
      {
        (null === children || void 0 === children) ? null :
          Array.isArray(children) ?
            children.flat(Number.MAX_SAFE_INTEGER).map(render_item) :
            render_item(children, 0)
      }
    </div>
  );
}
