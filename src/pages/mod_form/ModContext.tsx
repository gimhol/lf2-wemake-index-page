import type { IRecord } from "@/api/listModRecords";
import { createContext } from "react";

export interface IModContextValue {
  editing?: { open?: boolean; data?: Partial<IRecord>; }
  previewing?: { open?: boolean; mod_id?: number; }
  
  edit(data?: Partial<IRecord>): void;
  preview(mod_id?: number): void;
}
export const ModContext = createContext<IModContextValue>({
  edit() { },
  preview() { },
});
