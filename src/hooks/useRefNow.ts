import { useRef } from "react";

export function useRefNow<T>(v: T) {
  const r = useRef(v);
  // eslint-disable-next-line react-hooks/refs
  r.current = v;
  return r;
}
