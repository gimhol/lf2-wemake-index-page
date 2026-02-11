import type { PropsWithChildren } from "react";
import { Toast } from "./_Toast";
import { _useToast } from "./_useToast";

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
