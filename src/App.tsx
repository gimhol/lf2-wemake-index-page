import type { Dayjs } from "dayjs";
import { useEffect, useState } from "react";
import { createHashRouter, RouterProvider } from "react-router";
import Viewer from "viewerjs";
import 'viewerjs/dist/viewer.min.css';
import { Paths } from "./Paths";
import { Calendar } from "./gimd/Calendar/Calendar";
import Toast from "./gimd/Toast";
import { Tooltip } from "./gimd/Tooltip";
const viewer = new Viewer(document.body, {
  filter: (img: unknown) => {
    if (!img) return false;
    if (!(img instanceof HTMLImageElement)) return false
    const parent = img.parentElement
    if (parent?.classList.contains('viewer-canvas')) return false
    if (parent?.getAttribute('data-viewer-action') == 'view') return false;
    if (img.src.startsWith('data:')) return false;
    if (img.src.startsWith(location.protocol + '//' + location.host))
      return false;
    return true;
  },
})
const router = createHashRouter(Paths.Routes);
export default function App() {
  const [ranges, setRanges] = useState<[Dayjs, Dayjs][]>();

  useEffect(() => {
    const click = (e: PointerEvent) => {
      alert(e.button)
      const img = e.target
      if (!(img instanceof HTMLImageElement)) return
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      if (!(viewer as any).images.some((v: any) => v == img)) {
        viewer.update();
        img.click();
      }
      e.stopPropagation();
      e.preventDefault();
    }
    document.addEventListener('click', click)
    return () => document.removeEventListener('click', click)
  }, [])
  if (!window) {
    return (
      <Tooltip
        style={{ padding: 0, borderWidth: 0, overflow: 'hidden', background: 'none' }}
        title={
          <Calendar
            style={{ padding: `5px` }}
            ranges={ranges}
            whenRanges={setRanges}
          />
        }>
        <button>aa</button>
      </Tooltip>
    )
  }
  return (
    <Toast.Provider>
      <RouterProvider router={router} />
    </Toast.Provider>
  )
}