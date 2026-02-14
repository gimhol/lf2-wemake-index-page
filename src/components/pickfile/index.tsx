import { usePropState } from "@/utils/usePropState";
import cns from "classnames";
import { useEffect, useMemo, type HTMLAttributes, type InputHTMLAttributes } from "react";
import { FilePickerCtx, type FilePickerContextValue, type IPickedFile } from "./_Common";
import { Images } from "./_Images";
import csses from "./index.module.scss";

export interface IPickFileProps extends
  HTMLAttributes<HTMLDivElement>,
  Pick<InputHTMLAttributes<HTMLInputElement>, 'multiple' | 'accept'> {
  classNames?: Classnames<'root'>;
  styles?: Styles<'root'>;
  max?: number;
  disabled?: boolean;
  value?: IPickedFile[];
  whenChange?(files?: IPickedFile[]): void;
}
export function PickFile(props: IPickFileProps) {
  const {
    className, style, classNames, max = Number.MAX_SAFE_INTEGER, styles,
    children, multiple, accept, disabled, value, whenChange, ..._p
  } = props;
  const [files, set_files] = usePropState(value, whenChange)
  const object_urls = useMemo(() => new Set<string>(), [])
  useEffect(() => {
    return () => {
      for (const u of object_urls) {
        URL.revokeObjectURL(u);
        object_urls.clear();
      }
    }
  }, [object_urls])

  const ctx_value = useMemo<FilePickerContextValue>(() => {
    const add = (news: Partial<IPickedFile>[]) => {
      if (!news.length) return
      const temp = new Set<IPickedFile>(files?.length ? [...files] : [])
      for (const n of news) {
        const { file, name } = n
        let { url } = n
        if (file) {
          // eslint-disable-next-line react-hooks/immutability
          if (!url) object_urls.add(url = URL.createObjectURL(file))
          temp.add({
            file: file,
            name: name || file.name,
            url,
          })
        } else if (url) {
          temp.add({
            name: name || url,
            url: url,
            file: file
          })
        }
      }
      const next = Array.from(temp).slice(0, max)
      if (next.length === (files?.length || 0)) return;
      set_files(next.length ? next : void 0)
    }
    const remove = (file: IPickedFile) => {
      set_files(files?.filter(v => v !== file))
    }
    return {
      files,
      max,
      multiple,
      accept,
      disabled,
      open: () => {
        if (files && files.length > max) return
        const el = document.createElement('input')
        el.type = 'file'
        if (typeof multiple === 'boolean') el.multiple = multiple
        if (typeof accept === 'string') el.accept = accept
        el.onchange = () => add(el.files?.length ? Array.from(el.files).map(file => ({ file })) : [])
        el.click();
      },
      remove,
      add,
    }
  }, [files, max, multiple, accept, disabled, object_urls, set_files])

  return (
    <FilePickerCtx.Provider value={ctx_value}>
      <div
        className={cns(csses.pickfileroot, disabled && csses.disabled, className, classNames?.root)}
        style={{ ...style, ...styles?.root }}
        {..._p}>
        {children}
      </div>
    </FilePickerCtx.Provider>
  )

}
PickFile.Images = Images
