import type { IFileInfo } from "@/api/listModFiles";
import type { ReactNode } from "react";
import { Picture } from "./Picture";

export function get_icon(me: IFileInfo): ReactNode {
  const { type, content_type } = me;
  if (!type) return '📂'
  switch (type) {
    case "dir": return '📂';
    case "mod": return '🧰';
    case "file":
      if (content_type && icon_map[content_type]) {
        const w = icon_map[content_type];
        if (typeof w !== 'function') return w;
        return w(me)
      }
      return '📄'
  }
  return '⁉️';
}
export function get_icon_title(me: IFileInfo): string {
  const { type, content_type } = me;
  if (!type) return 'open_dir'
  switch (type) {
    case "dir": return 'open_dir'
    case "mod": return 'open_mod_dir'
    case "file":
      if (content_type && title_map[content_type]) {
        const w = title_map[content_type];
        if (typeof w !== 'function') return w;
        return w(me)
      }
      return ''
  }
  return ''
}


// https://lfwm.gim.ink/user/2/220/ea6ad6da776da18b7153db0721f8196e?x-oss-process=image/resize,w_50

const img_icon = (me: IFileInfo): ReactNode => {
  if (!me.url) return '🖼️';
  const s = 20
  return (
    <Picture
      src={me.url + `?x-oss-process=image/resize,w_${s},h_${s}`}
      width={16}
      height={16}
      alt={`open file: ${me.name}`} />
  )
}
const title_map: { [x in string]?: string | ((me: IFileInfo) => string) } = {
  'image/apng': 'view_picture',
  'image/avif': 'view_picture',
  'image/bmp': 'view_picture',
  'image/gif': 'view_picture',
  'image/jpeg': 'view_picture',
  'image/png': 'view_picture',
  'image/tiff': 'view_picture',
  'image/svg+xml': 'view_picture',
  'image/webp': 'view_picture'
}
const icon_map: { [x in string]?: ReactNode | ((me: IFileInfo) => ReactNode) } = {
  'application/zip': '📦️',
  'application/x-zip': '📦️',
  'application/x-zip-compressed': '📦️',
  'image/apng': img_icon,
  'image/avif': img_icon,
  'image/bmp': img_icon,
  'image/gif': img_icon,
  'image/jpeg': img_icon,
  'image/png': img_icon,
  'image/tiff': img_icon,
  'image/svg+xml': img_icon,
  'image/webp': img_icon,
}





