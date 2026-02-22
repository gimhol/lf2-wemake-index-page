/* eslint-disable react-hooks/rules-of-hooks */
import { createContext, useCallback, useEffect, useMemo, useState, type PropsWithChildren } from "react";

export type MaskContainer = Element | DocumentFragment;
export type ValueOfGetter<T> = T | (() => T);

let _new_mask_id = 0;
const new_mask_id = () => '' + (_new_mask_id++)
interface IMaskContextValue {
  masks: string[];
  new_mask_id(): string;
  open(v: string): void;
  close(v: string): void;
  container?: ValueOfGetter<MaskContainer>;
}
export const mask_context = createContext<IMaskContextValue>({
  masks: [],
  new_mask_id,
  open() { },
  close() { },
  container: document.body,
});
export interface IMaskProviderProps extends PropsWithChildren {
  container?: ValueOfGetter<MaskContainer>;
}
export function _Provider(props: IMaskProviderProps) {
  const { container } = props;

  const _container = typeof container === 'function' ? container() : (container || document.body);
  const [masks, set_masks] = useState<string[]>([]);

  useEffect(() => {
    document.getElementById('root')!.style.filter = masks.length ? `blur(${masks.length * 5}px)` : ''
  }, [masks])

  const open = useCallback((id: string) =>
    set_masks(p => p.includes(id) ? p : [...p, id]), [])
  const close = useCallback((id: string) =>
    set_masks(p => p.includes(id) ? p.filter(v => v != id) : p), [])
  const context_value = useMemo(() => {
    return { masks, new_mask_id, open, close, container: _container }
  }, [masks, _container, open, close])

  return (
    <mask_context.Provider  {...props} value={context_value} />
  )
}
