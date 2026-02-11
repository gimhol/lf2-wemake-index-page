export function ctrl_a_bounding(e: React.KeyboardEvent, el?: Element | null | undefined) {
  if (el && document.activeElement !== el) return;
  if (!el && e.target !== document.activeElement) return;
  if (!(e.ctrlKey || e.metaKey) || e.key?.toLowerCase() !== 'a')
    return;
  e.preventDefault();
  e.stopPropagation();

  const selection = window.getSelection();
  if (!selection) return;
  const range = document.createRange();
  selection.removeAllRanges();

  if (!el) return
  range.selectNodeContents(el);
  selection.addRange(range);
}
