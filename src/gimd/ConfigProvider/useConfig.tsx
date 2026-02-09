import { useContext } from "react";
import { global_context } from "./global_context";


export function useConfig(ctx = global_context) {
  return useContext(ctx);
}
