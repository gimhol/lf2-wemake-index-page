/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect } from "react";
import { createHashRouter, RouterProvider } from "react-router";
import Viewer from "viewerjs";
import 'viewerjs/dist/viewer.min.css';
import { Paths } from "./Paths";
import Toast from "./gimd/Toast";

const router = createHashRouter(Paths.Routes);
export default function App() {
  useEffect(() => {
    const filter = (img: unknown) => {
      if (!img) return false;
      if (!(img instanceof HTMLImageElement)) return false
      const parent = img.parentElement
      if (parent?.classList.contains('viewer-canvas')) return false
      if (parent?.getAttribute('data-viewer-action') == 'view') return false;
      if (img.src.startsWith('data:')) return false;
      if (img.src.startsWith(location.protocol + '//' + location.host))
        return false;
      return true;
    }
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
    const click = (e: PointerEvent) => {
      if (e.button != 0) return;
      const img = e.target
      if (!filter(img)) return;
      if (!(img instanceof HTMLImageElement)) return

      let images = (viewer as any).images as HTMLImageElement[];
      if (!images.some(v => v == img))
        viewer.update();
      images = (viewer as any).images as HTMLImageElement[];
      viewer.view(images.indexOf(img))
      viewer.show()
      e.stopPropagation();
      e.preventDefault();
      e.stopImmediatePropagation()
    }
    document.addEventListener('click', click, { capture: true })
    return () => {
      document.removeEventListener('click', click)
      viewer.destroy();
    }
  }, [])

  return (
    <Toast.Provider>
      <RouterProvider router={router} />
    </Toast.Provider>
  )
}