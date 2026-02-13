import { createHashRouter, RouterProvider } from "react-router";
import { Paths } from "./Paths";
import Toast from "./gimd/Toast";

const router = createHashRouter(Paths.Routes);
export default function App() {
  return (
    <Toast.Provider>
      <RouterProvider router={router} />
    </Toast.Provider>
  )
}