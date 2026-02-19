import { Toast } from "@/gimd/Toast";
import { useCallback } from "react";
import { ossUploadModRecords } from "./ossUploadModRecords";
import { useOSS } from "./useOSS";

export function useOSSUploadModImages(opts: { mod_id?: number }) {
  const { mod_id } = opts;
  const [oss, sts] = useOSS();
  return useCallback(async (files: File[]) => {
    try {
      return ossUploadModRecords({ oss, sts, files, mod_id })
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (e: any) {
      Toast.error(e);
      throw e
    }
  }, [oss, sts, mod_id])
}

