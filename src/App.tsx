import type { Dayjs } from "dayjs";
import { useState } from "react";
import { createHashRouter, RouterProvider } from "react-router";
import { Paths } from "./Paths";
import { Calendar } from "./gimd/Calendar/Calendar";
import Toast from "./gimd/Toast";
import { Tooltip } from "./gimd/Tooltip";

const router = createHashRouter(Paths.Routes);
export default function App() {
  const [ranges, setRanges] = useState<[Dayjs, Dayjs][]>();

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