import Close from "@/art/ic_small_close.svg?react";
import { Text } from "@/gimd";
import { useEventListener } from "../hooks/useEventListener";
import type { TShortcutCombines } from "../hooks/useShortcut";
import classnames from "classnames";
import React, { type ReactNode, useCallback, useState } from "react";
import { SVG } from "../SVG";
import Button, { type IButtonProps } from "../Button";
import { Flex } from "../Flex";
import { type IMaskProps, Mask } from "../Mask";
import Show from "../Show";
import styles from "./index.module.scss";

export interface IModalProps extends Omit<IMaskProps, 'children' | 'title'> {
  title?: React.ReactNode;
  onCancel?: (e: React.MouseEvent | KeyboardEvent) => Promise<boolean | void> | boolean | void;
  onOk?: (e: React.MouseEvent | KeyboardEvent) => Promise<boolean | void> | boolean | void;
  autoClose?: boolean;
  children?: ((p: IModalProps) => React.ReactNode) | React.ReactNode;
  header?: ReactNode;
  footer?: ReactNode;
  okText?: string;
  okShortcut?: TShortcutCombines;
  cancelText?: string;
  cancelShortcut?: TShortcutCombines;
  hideFooter?: boolean;
  props?: {
    btn_cancel?: IButtonProps,
    btn_ok?: IButtonProps,
  },
  styles?: {
    mask?: React.CSSProperties,
    modal?: React.CSSProperties,
    header?: React.CSSProperties;
    content?: React.CSSProperties;
    footer?: React.CSSProperties,
  },
  classnames?: {
    mask?: string,
    modal?: React.CSSProperties,
    header?: string;
    content?: string;
    footer?: string;
  },
  draggable?: boolean
}

export function Modal(props: IModalProps) {
  const { open, title, children, onCancel: _onCancel, onOk: _onOk, autoClose = true,
    header,
    footer,
    hideFooter = false,
    classnames: {
      mask: mask_cn,
      modal: modal_cn,
      header: header_cn,
      content: content_cn,
      footer: footer_cn,
    } = {},
    styles: {
      mask: mask_style,
      modal: modal_style,
      header: header_style,
      content: content_style,
      footer: footer_style,
    } = {},
    okText = '确定',
    cancelText = '取消',
    okShortcut = 'Enter',
    cancelShortcut = 'Escape',
    className,
    style,
    props: {
      btn_cancel: btn_cancel_props = {},
      btn_ok: btn_ok_props = {},
    } = {},
    draggable = !0,
    ..._p
  } = props;
  const onCancel = async (e: React.MouseEvent | KeyboardEvent) =>
    await _onCancel?.(e) !== true && autoClose && _p.onClose?.()
  const onConfirm = async (e: React.MouseEvent | KeyboardEvent) =>
    await _onOk?.(e) !== true && autoClose && _p.onClose?.()

  const _mask_class_name = classnames(className, mask_cn)
  const _modal_class_name = classnames(styles.modal_root, modal_cn)
  const _header_class_name = classnames(styles.modal_head, header_cn);
  const _content_class_name = classnames(styles.modal_content, content_cn)
  const _footer_class_name = classnames(styles.modal_foot, { [styles.modal_foot_hide]: hideFooter }, footer_cn);

  const _mask_style: React.CSSProperties | undefined = { ...style, ...mask_style }
  const _modal_style: React.CSSProperties | undefined = modal_style
  const _header_style: React.CSSProperties | undefined = header_style
  const _content_style: React.CSSProperties | undefined = content_style
  const _footer_style: React.CSSProperties | undefined = footer_style
  const [ele_modal, set_ele_modal] = useState<HTMLDivElement | null>(null)

  const on_pointerdown = useCallback((e: PointerEvent) => {
    if (!ele_modal) return;
    let p = (e.target as HTMLElement | null)
    while (p) {
      if (p.classList.contains(styles.modal_head)) {
        break;
      } else if (p === ele_modal) {
        p = null
        break;
      }
      p = p.parentElement;
    }
    if (!p) { return; }

    const offsets = [0, 0]
    const { x, y } = ele_modal.getBoundingClientRect()
    offsets[0] = e.clientX - x
    offsets[1] = e.clientY - y
    const on_pointermove = (e: PointerEvent) => {
      const [a, b] = offsets;
      ele_modal.style.left = (e.clientX - a) + 'px'
      ele_modal.style.top = (e.clientY - b) + 'px'
      ele_modal.style.transform = 'none'
    }
    const on_pointerup = () => {
      window.removeEventListener('pointermove', on_pointermove)
      window.removeEventListener('pointerup', on_pointerup)
      window.removeEventListener('pointercancel', on_pointerup)
    }
    window.addEventListener('pointermove', on_pointermove)
    window.addEventListener('pointerup', on_pointerup)
    window.addEventListener('pointercancel', on_pointerup)
  }, [ele_modal])

  useEventListener(ele_modal, 'pointerdown', on_pointerdown, void 0, draggable)


  return (
    <Mask {..._p} open={open} className={_mask_class_name} style={_mask_style}>
      <div className={_modal_class_name} style={_modal_style} ref={r => set_ele_modal(r)}>
        <Show.Div yes={header !== void 0} children={header} />
        <Show yes={title !== void 0 && header === void 0}>
          <Flex
            className={_header_class_name}
            style={_header_style}
            gap={10}>
            <Text className={styles.modal_head_title} size='m'>
              {title}
            </Text>
            <Button
              size='s'
              onClick={onCancel}
              disabled={!open}
              shortcut={cancelShortcut}
              kind='icon'
              className={styles.modal_btn_close}
              {...btn_cancel_props}
              show_shrotcut={false}>
              <SVG c={Close}  />
            </Button>
          </Flex>
        </Show>
        <Show.Div yes={children !== void 0} className={_content_class_name} style={_content_style}>
          {typeof children === 'function' ? children({ ...props, onCancel, onOk: onConfirm }) : children}
        </Show.Div>
        <Show.Div yes={footer !== void 0} children={footer} />
        <Show.Div yes={footer === void 0} className={_footer_class_name} style={_footer_style}>
          <Button
            size='s'
            onClick={onCancel}
            disabled={!open || footer !== void 0}
            shortcut={cancelShortcut}
            {...btn_cancel_props} >
            {cancelText}
          </Button>
          <Button
            size='s'
            onClick={onConfirm}
            disabled={!open || footer !== void 0}
            shortcut={okShortcut}
            {...btn_ok_props}>
            {okText}
          </Button>
        </Show.Div>
      </div>
    </Mask>
  )
}
