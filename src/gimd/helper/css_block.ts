
import { type CSSProperties } from "react";

const px_lover: (keyof CSSProperties)[] = [
  "width", "height", "minHeight", "minWidth", "maxWidth", "maxHeight",
  "paddingLeft", "paddingLeft", "paddingTop", "paddingBottom",
  "marginTop", "marginBottom", "marginLeft", "marginRight", "lineHeight",
]
const temp = document.createElement('div')

export function value_adapter(props: CSSProperties, key: keyof CSSProperties): string | undefined {
  const value = props[key]
  if (value == null || value == undefined) return;
  if (typeof value === 'string') return value;
  if (typeof value === 'number' && px_lover.some(v => v === key))
    return "" + value + "px"
  return "" + value
}

export function css_block(name: string, props: CSSProperties) {
  temp.removeAttribute("style");
  for (const key in props) {
    const value = value_adapter(props, key as keyof CSSProperties);
    if (value === void 0 || value === null) continue;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (temp.style as any)[key] = value;
  }
  const style_text = temp.getAttribute("style");
  if (!style_text) return "";
  const spaces_style_text = style_text
    .replace(/;/g, ';\n')
    .replace(/;(\S)/g, (a) => `${a}\n  `)
  return `${name} { \n  ${spaces_style_text}}\n`;
};
export interface ICSSBlocks {
  [x: string]: Partial<CSSProperties>
}
export function css_blocks(map: ICSSBlocks) {
  let ret = ''
  for (const key in map) {
    ret += css_block(key, map[key])
  }
  return ret;
}