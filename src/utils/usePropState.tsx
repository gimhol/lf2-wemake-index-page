import { useRefNow } from "@/hooks/useRefNow";
import { useCallback, useState } from "react";

export function usePropState<T>(value?: T, whenChange?: (v?: T) => void) {
  const [_inner, _set_inner] = useState(value);
  const __value = whenChange ? value : _inner;
  const ref_whenChange = useRefNow(whenChange ?? _set_inner)
  const __set_value = useCallback((v?: T) => {
    ref_whenChange.current(v)
  }, [ref_whenChange])
  return [__value, __set_value] as const;
}
