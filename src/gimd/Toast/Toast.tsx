import { Space } from "@/pages/Main/Space";
import { useState, useRef, useEffect, type PropsWithChildren } from "react";
import { Badge } from "../Badge";
import classnames from "classnames";
import type { ToastInfo } from "./ToastInfo";
import styles from "./index.module.scss";
import type { IUseToastOpts, IUseToastRet } from "./useToast";

export interface IToastProps {
  info: ToastInfo;
  onDead: (info: ToastInfo) => void;
}
export function Toast(props: IToastProps) {
  const { info, onDead } = props
  const { msg } = info
  const [dead, setDead] = useState(false)
  const eleRef = useRef<HTMLDivElement>(null)
  const innerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const ele = eleRef.current;
    const inner = innerRef.current;
    if (!ele || !inner) return;
    const { paddingBottom, paddingTop } = getComputedStyle(ele)
    ele.style.height = inner.clientHeight +
      parseInt(paddingBottom) +
      parseInt(paddingTop) + 'px';
    const { duration = 5000 } = info;
    let tid_1 = 0;
    const f = () => {
      setDead(true);
      tid_1 = window.setTimeout(() => onDead(info), 250)
      if (ele) ele.style.height = '0px';
    };
    const tid_0 = window.setTimeout(f, duration);
    return () => {
      window.clearTimeout(tid_0);
      if (tid_1) window.clearTimeout(tid_1)
    }
  }, [info, onDead])

  return (
    <div ref={eleRef} className={classnames(styles.toast, dead && styles.toast_dead)}>
      <Space _ref={innerRef} size='s' className={styles.toast_inner} align='center'>
        {msg}{info.badge !== false && info.count ? <Badge label={info.count} color={info.badge_color} /> : void 0}
      </Space>
    </div>
  )
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
Toast.show = (_msg: string | ToastInfo): void => void 0

// eslint-disable-next-line @typescript-eslint/no-unused-vars
Toast.Provider = (_props: PropsWithChildren): React.ReactNode => void 0

// eslint-disable-next-line @typescript-eslint/no-unused-vars
Toast.useToast = (_opts?: IUseToastOpts): IUseToastRet => [() => { }, <></>, () => { },]


