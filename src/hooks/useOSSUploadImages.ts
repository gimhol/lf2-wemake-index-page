import { useCallback } from "react";
import { ossUploadFiles } from "./ossUploadFiles";
import { useOSS } from "./useOSS";

export function useOSSUploadImages(getObjectName: (file: File, sts: IOSSStsInfo) => Promise<string>) {
  const [oss, sts] = useOSS();
  const uploadImage = useCallback((files: File[]) => {
    return ossUploadFiles({ files, oss, sts, getObjectName })
  }, [oss, sts, getObjectName])
  return uploadImage
}

