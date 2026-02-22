/* eslint-disable @typescript-eslint/no-namespace */
import React from "react"
import type { RouteObject } from "react-router"
import { Loading } from "./components/loading"
import { ModProvider } from "./pages/mod_form/ModProvider"
export namespace Paths {
  export enum All {
    _ = '',
    Main = '/',
    Info = '/info/:game_id',
    Workspace = '/yours',
    InnerInfo = '/:game_id',
    ModForm = '/mod_form/:id',
  }
  export const Components: Record<All, React.ComponentType | null> = {
    [All._]: null,
    [All.Main]: React.lazy(() => import("./pages/main")),
    [All.Workspace]: React.lazy(() => import("./pages/yours")),
    [All.InnerInfo]: React.lazy(() => import("./pages/info")),
    [All.Info]: React.lazy(() => import("./pages/info")),
    [All.ModForm]: React.lazy(() => import("./pages/mod_form")),
  }
  export const Relations: { [x in All]?: All[] } = {
    [All._]: [
      All.Info,
      All.ModForm,
      All.Main
    ],
    [All.Main]: [
      All.Workspace,
      All.InnerInfo
    ]
  }
  export const gen_route_obj = (path: All, parent?: All): RouteObject => {
    let str_path: string = path
    if (parent !== void 0) {
      if (path.startsWith(parent)) {
        str_path = path.replace(parent, '')
      }
      str_path = str_path.replace(/^\/(.*?)/, (_, a) => a)
    }
    const Component = Components[path] || (() => `component set as ${Components[path]}`);
    const ret: RouteObject = {
      path: str_path,
      element: (
        <React.Suspense fallback={<Loading loading={true} />}>
          <ModProvider>
            <Component />
          </ModProvider>
        </React.Suspense>
      )
    }
    if (Relations[path]) {
      ret.children = Relations[path].map((child_path) => gen_route_obj(child_path, path))
    }
    return ret;
  }
  export const Routes: RouteObject[] = Paths.Relations[Paths.All._]!.map(c => gen_route_obj(c))
}