import { useContext } from "react";
import { context } from "./context";

export function useGlobalValue() {
  return useContext(context);
}
