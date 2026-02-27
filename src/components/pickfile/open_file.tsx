

export function open_file(
  multiple: boolean | undefined,
  accept: string | undefined,
  add?: (news: { file: File }[]) => void
): Promise<File[]> {
  const el = document.createElement('input');
  el.type = 'file';
  if (typeof multiple === 'boolean') el.multiple = multiple;
  if (typeof accept === 'string') el.accept = accept;

  let _resolve: (news: File[]) => void
  el.onchange = () => {
    const files = el.files?.length ? Array.from(el.files) : [];
    add?.(files.length ? files.map(file => ({ file })) : [])
    _resolve(files)
  };
  el.click();
  return new Promise((resolve) => {
    _resolve = resolve;
  })
}
