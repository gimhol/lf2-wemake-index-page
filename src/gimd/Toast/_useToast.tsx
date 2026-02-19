import { useCallback, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Toast, } from ".";
import type { IUseToastOpts, IUseToastRet, IToastInfo } from "./_Common";
import styles from "./index.module.scss";

export const _useToast = function useToast(opts?: null | IUseToastOpts): IUseToastRet {
  const container = opts?.container ?? document.body
  const ref_new_id = useRef(0);
  const ref_msg_list = useRef<IToastInfo[]>([]);
  const [msg_list, set_msg_list] = useState<IToastInfo[]>([]);

  const toast = useCallback((msg: string | IToastInfo | Error, type?: string) => {
    const prev_msg_list = ref_msg_list.current;
    let next_msg_list: IToastInfo[];
    if (typeof msg === 'string') {
      const idx = prev_msg_list.findIndex(v => v.msg === msg);
      if (idx < 0) {
        next_msg_list = [{ msg, type, id: ++ref_new_id.current }, ...prev_msg_list];
      } else {
        const [item] = prev_msg_list.splice(idx, 1);
        const count = (item.count || 0) + 1;
        const new_item: IToastInfo = { ...item, count }
        next_msg_list = [new_item, ...prev_msg_list]
      }
    } else if ('message' in msg) {
      const text = typeof msg.cause === 'string' ? msg.cause : msg.message
      const idx = prev_msg_list.findIndex(i => i.msg === text)
      if (idx < 0) {
        next_msg_list = [{ msg: text, type: type ?? 'error' }, ...prev_msg_list]
      } else {
        const prev = prev_msg_list[idx]
        next_msg_list = [...prev_msg_list]
        next_msg_list[idx] = { ...prev, count: ((next_msg_list[idx].count || 0) + 1) }
      }
    } else if (msg.id === void 0) {
      next_msg_list = [{ ...msg, type, id: ++ref_new_id.current }, ...prev_msg_list]
    } else {
      const idx = prev_msg_list.findIndex(i => i.id === msg.id)
      if (idx < 0) {
        next_msg_list = [{ ...msg, type }, ...prev_msg_list]
      } else {
        next_msg_list = [...prev_msg_list]
        next_msg_list[idx] = { ...msg, count: ((next_msg_list[idx].count || 0) + 1) }
      }
    }
    set_msg_list(ref_msg_list.current = next_msg_list)
  }, [])

  const remove_toast = useCallback((target: IToastInfo) => {
    set_msg_list(ref_msg_list.current = ref_msg_list.current.filter(v => v.id !== target.id))
  }, [])

  const ctx = useMemo<React.ReactNode>(() => {
    if (!msg_list.length) return <></>
    const ele = (
      <div className={styles.toast_list_container}>
        {msg_list.map(v => <Toast key={v.id} info={v} onDead={remove_toast} />)}
      </div>
    )
    return container ? createPortal(ele, container) : ele
  }, [container, msg_list, remove_toast])

  return useMemo<IUseToastRet>(() => [
    Object.assign(toast, {
      success: (r: string | Error | IToastInfo) => toast(r, 'success'),
      error: (r: string | Error | IToastInfo) => toast(r, 'error')
    }),
    ctx] as const,
    [toast, ctx])
}