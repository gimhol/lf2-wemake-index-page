import Viewer from 'viewerjs'
import 'viewerjs/dist/viewer.min.css'
export class ImagesViewer {
  static open(list: { url: string, alt?: string, title?: string }[], idx: number) {
    if (!list.length) return;
    idx = Math.max(0, Math.min(list.length - 1))
    const div = document.createElement('div')
    const imgs = list.map(item => {
      const img = document.createElement('img')
      img.src = item.url; img.width = 1; img.height = 1;
      img.alt = item.alt ?? item.url;
      img.title = item.title ?? item.url;
      return img
    }).filter(Boolean) as HTMLImageElement[];
    div.append(...imgs)
    new Viewer(div)
    imgs[idx].click()
  }
}