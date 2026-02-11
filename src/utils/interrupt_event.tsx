export function interrupt_event(e: React.UIEvent | Event) {
  e.stopPropagation();
  e.preventDefault();
}
