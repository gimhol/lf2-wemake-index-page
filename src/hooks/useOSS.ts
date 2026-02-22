import { useContext } from "react";
import { OSSContext } from "./OSSContext";

export function useOSS() {
  const { oss, sts } = useContext(OSSContext)
  return [oss, sts] as const;
}
