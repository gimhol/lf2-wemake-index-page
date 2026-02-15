import type { IToast } from "@/gimd/Toast/_useToast";
import { useCallback } from "react";
import { ossUploadModRecords } from "./ossUploadModRecords";
import { useOSS } from "./useOSS";

export function useOSSUploadModImages(opts: { mod_id?: number, toast?: IToast }) {
  const { mod_id, toast } = opts;
  const [oss, sts] = useOSS();
  return useCallback(async (files: File[]) => {
    try {
      return ossUploadModRecords({ oss, sts, files, mod_id })
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (e: any) {
      toast?.error(e);
      throw e
    }
  }, [oss, sts, mod_id, toast])
}

