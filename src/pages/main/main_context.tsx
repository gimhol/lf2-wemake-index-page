import type { Info } from "@/base/Info";
import { createContext } from "react";


export const main_context = createContext<{ info?: Info }>({});
