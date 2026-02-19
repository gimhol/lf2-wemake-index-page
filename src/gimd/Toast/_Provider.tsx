/* eslint-disable react-hooks/rules-of-hooks */
import { useCallback, useEffect, type PropsWithChildren } from "react";
import { Toast } from "./_Toast";
import { _useToast } from "./_useToast";
export interface IToastOpts {
  container?: null | HTMLElement;
}
export interface IProviderProps extends IToastOpts, PropsWithChildren {

}

export function _Provider(props: IProviderProps) {
  const [toast, toastCtx] = _useToast();


  Object.assign(Toast, toast);
  Toast.useError = useCallback((text: unknown) => {
    useEffect(() => {
      if (text == void 0 || text === null || text === '') return;
      toast('' + text)
    }, [text])
  }, [toast])


  return (
    <>
      {toastCtx}
      {props.children}
    </>
  );
}

