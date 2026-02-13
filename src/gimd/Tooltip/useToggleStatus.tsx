/* eslint-disable react-hooks/set-state-in-effect */
import { useEffect, useState } from "react";

export function useToggleStatus(open: unknown, [open_delay, close_duration]: [number, number] = [30, 300]) {
  const [status, set_status] = useState<'opening' | 'closing' | ''>(open ? 'opening' : '');
  useEffect(() => {
    if (open) {
      const tid = setTimeout(() => set_status('opening'), open_delay);
      return () => clearTimeout(tid);
    } else {
      set_status('closing');
      const tid = setTimeout(() => set_status(''), close_duration);
      return () => clearTimeout(tid);
    }
  }, [open, open_delay, close_duration]);
  return [!(open || status), status];
}
