import Viewer from 'viewerjs';
import 'viewerjs/dist/viewer.min.css';
export interface IImageItem {
  url?: string,
  name?: string,
}
export type TImageItem = string | IImageItem | null | undefined
export class ImagesViewer {
  static ensure_item(v: TImageItem): Required<IImageItem> | null {
    if (!v) return null
    if (typeof v === 'string') {
      v = v.trim();
      return v ? { url: v, name: v } : null;
    } else if (typeof v === 'object') {
      let { url, name } = v;
      url = url?.trim()
      if (!url) return null
      name = name?.trim()
      return v ? { url, name: name || url } : null;
    }
    return null
  }

  static open(src: TImageItem | TImageItem[], idx: number = 0) {
    if (!src) return;
    const list: Required<IImageItem>[] = (Array.isArray(src) ? src : [src])
      .map(v => this.ensure_item(v)!)
      .filter(Boolean);
    if (!list.length) return
    idx = Math.max(0, Math.min(list.length - 1))
    const div = document.createElement('div')
    const imgs = list.map(item => {
      if (!item.url) return;
      const img = document.createElement('img')
      img.width = img.height = 1;
      img.src = item.url;
      img.alt = item.name;
      return img
    }).filter(Boolean) as HTMLImageElement[];
    div.append(...imgs)
    new Viewer(div)
    imgs[idx].click()
  }
}