import type { PropsWithChildren } from "react";
import { Toast } from "./Toast";
import { _useToast } from "./useToast";

export function _Provider(props: PropsWithChildren) {
  const [toast, toastCtx] = _useToast();
  Toast.show = toast;
  return (
    <>
      {toastCtx}
      {props.children}
    </>
  );
}
