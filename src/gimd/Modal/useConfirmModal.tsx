import { useCallback, useState } from "react";
import { type IModalProps, Modal } from ".";

export function useConfirmModal(props: Omit<IModalProps, 'open' | 'onClose'>) {
  const [open, setOpen] = useState(false);
  const show = useCallback((v: boolean = true) => setOpen(v), []);
  const ctx = (
    <Modal
      {...props}
      open={open}
      onClose={() => setOpen(false)} />
  );
  return [show, ctx] as const;
}
