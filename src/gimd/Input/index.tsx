import _classnames from "classnames";
import { type ForwardedRef, forwardRef, useRef } from "react";
import _styles from "./styles.module.scss";
export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  autoTrim?: boolean | 'start' | 'end';
}
export const Input = forwardRef<HTMLInputElement, InputProps>(
  (props: InputProps, f_ref: ForwardedRef<HTMLInputElement>) => {
    const { type = 'text', className, autoTrim = false, onBlur, ..._p } = props;
    const root_classname = _classnames(_styles.input, className);
    const ref = useRef<HTMLInputElement | null>(null)
    const on_ref = (ele: HTMLInputElement | null) => {
      ref.current = ele;
      if (f_ref === null) return;
      else if (typeof f_ref === 'function') f_ref(ele);
      else f_ref.current = ele
    }

    const on_blur = autoTrim ? (e: React.FocusEvent<HTMLInputElement, Element>) => {
      switch (autoTrim) {
        case 'start':
          e.target.value = e.target.value.trimStart();
          break;
        case 'end':
          e.target.value = e.target.value.trimEnd();
          break;
        case true:
          e.target.value = e.target.value.trim();
          break;
      }
      onBlur?.(e);
    } : onBlur;

    return <input type={type} ref={on_ref} className={root_classname} onBlur={on_blur} {..._p} />
  }
)