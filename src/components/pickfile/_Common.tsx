import { createContext } from "react";
export interface IPickedFile {
  readonly file?: File;
  readonly name: string;
  readonly url: string;
  readonly progress?: number;
}
export interface FilePickerContextValue {
  files?: IPickedFile[];
  max?: number;
  multiple?: boolean;
  accept?: string;
  remove(file: IPickedFile): void;
  add(files: Partial<IPickedFile>[]): void;
  disabled?: boolean;
  open(): void;
}
export const FilePickerCtx = createContext<FilePickerContextValue>({
  remove() { },
  add() { },
  open() { },
});
