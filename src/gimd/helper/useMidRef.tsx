import React, { useRef } from "react";


export function useMidRef<T>(_ref: React.Ref<T> | undefined) {
  const ref_self = useRef<T>(null);
  const on_ref = (ref: T) => {
    ref_self.current = ref;
    if (typeof _ref === 'function') _ref(ref);
    else if (_ref) _ref.current = ref;
  };
  return [ref_self, on_ref];
}
