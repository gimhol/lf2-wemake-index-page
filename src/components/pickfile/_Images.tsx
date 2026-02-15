import { interrupt_event } from "@/utils/interrupt_event";
import cns from "classnames";
import { useContext, useMemo, type HTMLAttributes, type MouseEvent } from "react";
import { IconButton } from "../button/IconButton";
import csses from "./index.module.scss";
import { FilePickerCtx, type FilePickerContextValue, type IPickedFile } from "./_Common";
import { file_size_txt } from "@/utils/file_size_txt";

export interface IFilePickerImagesProps extends HTMLAttributes<HTMLDivElement> {
  _?: never;
  classNames?: Classnames<'cell' | 'close' | 'img' | 'bottom'>;
  onNameClick?(e: MouseEvent<HTMLDivElement>, record: IPickedFile, p: FilePickerContextValue): void
  onFileClick?(e: MouseEvent<HTMLDivElement>, record: IPickedFile, p: FilePickerContextValue): void
  onFileClose?(e: MouseEvent<HTMLButtonElement>, record: IPickedFile, p: FilePickerContextValue): void;
}
export function Images(props: IFilePickerImagesProps) {
  const ctx = useContext(FilePickerCtx);
  const { files, max = Number.MAX_SAFE_INTEGER, remove, add, open, disabled } = ctx
  const { className, classNames, onNameClick, onFileClick, onFileClose, ..._p } = props;
  const urls = useMemo(() => files?.map(file => file.url), [files])
  return <>
    <div
      className={cns(csses.pickfile_images, className)}
      {..._p}
      onDragOver={e => {
        e.preventDefault()
        e.stopPropagation()
        if (disabled) return;
      }}
      onDrop={e => {
        e.preventDefault()
        e.stopPropagation()
        if (disabled) return;
        if (!e.dataTransfer.files.length) return
        const files = Array.from(e.dataTransfer.files).filter(file => {
          return file.type.startsWith('image/')
        });
        if (!files.length) return
        add(files.map(file => ({ file })))
      }}>
      {files?.map((record, idx) => {
        return (
          <div
            key={record.name + '_' + idx}
            className={cns(csses.cell, onFileClick && csses.cell_clickable, classNames?.cell,)}
            onClick={e => {
              if (!onFileClick) return
              interrupt_event(e)
              if (disabled) return;
              onFileClick?.(e, record, ctx)
            }}>
            <img
              className={cns(csses.img, classNames?.img)}
              src={urls?.[idx]}
              alt={record.name}
              title={record.name} />
            <IconButton
              gone={disabled}
              className={cns(csses.btn_close, classNames?.close)}
              onClick={e => {
                interrupt_event(e);
                if (disabled) return;
                onFileClose?.(e, record, ctx);
                remove(record);
              }}
              icon="✖︎" />
            <div
              className={cns(csses.bottom, onFileClick && csses.bottom_clickable, classNames?.bottom)}
              onClick={e => {
                if (!onNameClick) return
                interrupt_event(e)
                if (disabled) return;
                onNameClick?.(e, record, ctx)
              }}>
              {typeof record.progress === 'number' ? <div className={csses.progress} title={record.name}
                style={{ width: `${(100 * record.progress).toFixed(1)}%` }} /> : null}
              {record.file?.size ? `(${file_size_txt(record.file.size)})` : null}{record.name} 
            </div>
          </div>
        )
      })}
      {(disabled || (files?.length && files.length >= max)) ? null :
        <div className={cns(csses.e_cell, csses.cell_clickable, classNames?.cell)} onClick={(e) => {
          interrupt_event(e);
          open()
        }}>
          {"Click & Pick\nor\nDrop Pictures\nin here\n"}
        </div>
      }
    </div>
  </>
}