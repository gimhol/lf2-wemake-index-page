import type _OSS from "ali-oss";
import { createContext } from "react";
export interface OSS extends _OSS {
  debugging_options: _OSS.Options;
}
export interface IOSSContextValue {
  loading?: boolean;
  oss?: OSS;
  sts?: IOSSStsInfo;
}
export const OSSContext = createContext<IOSSContextValue>({});
