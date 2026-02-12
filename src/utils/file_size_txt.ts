

export function file_size_txt(n: number) {
  if (n < 1024) return `${n} B`;
  if (n < 1048576) return `${(n / 1024).toFixed(1).replace('.0', '')} KB`;
  if (n < 1073741824) return `${(n / 1048576).toFixed(1).replace('.0', '')} MB`;
  return `${(n / 1073741824).toFixed(1).replace('.0', '')} GB`;
}
