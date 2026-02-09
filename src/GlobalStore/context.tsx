import { createContext, type Dispatch, type SetStateAction } from "react";
import type { IGlobalValue } from "./IGlobalValue";
import { init_value } from "./init_value";

export const context = createContext<{
  global_value: IGlobalValue;
  set_global_value: Dispatch<SetStateAction<IGlobalValue>>;
}>({ global_value: init_value, set_global_value: () => void 0 });
