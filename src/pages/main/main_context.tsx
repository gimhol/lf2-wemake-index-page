import type { IRecord } from "@/api/listModRecords";
import type { Info } from "@/base/Info";
import { createContext } from "react";


export const MainContext = createContext<{ info?: Info, record?: IRecord }>({});
