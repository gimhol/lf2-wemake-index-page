import { createContext, type Dispatch, type SetStateAction } from "react";
import type { IGlobalValue } from "./IGlobalValue";
import { init_value } from "./init_value";

export type ContextValue = {
  global_value: IGlobalValue;
  set_global_value: Dispatch<SetStateAction<IGlobalValue>>;
}
export const context_value: ContextValue = {
  global_value: init_value,
  set_global_value: () => void 0
}
export const context = createContext<ContextValue>(context_value);
