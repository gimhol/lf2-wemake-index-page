import type { ChangeEvent, UIEvent } from "react";

export function interrupt_event(e: UIEvent | Event | ChangeEvent) {
  e.stopPropagation();
  e.preventDefault();
}
