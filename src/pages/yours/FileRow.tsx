import { IconButton } from "@/components/button/IconButton"
import { Dropdown } from "@/gimd/Dropdown"
import { filename_ok } from "@/utils/filename_ok"
import { interrupt_event } from "@/utils/interrupt_event"
import classnames from "classnames"
import { useState, type ReactNode } from "react"
import { useTranslation } from "react-i18next"
import csses from "./styles.module.scss"

export interface IFileRowProps extends React.HTMLAttributes<HTMLDivElement> {
  name?: string;
  modify_time?: ReactNode;
  create_time?: ReactNode;
  onNameChanged?(v: string): Promise<boolean>;
  renameable?: boolean;
  onDel?(): void;
  onOpen?(): void;
  deletable?: boolean;
  icon?: string;
  disabled?: boolean;
  renameing?: boolean;

}
export function FileRow(props: IFileRowProps) {
  const { t } = useTranslation()
  const {
    name: __name,
    renameable = true,
    onNameChanged,
    renameing,
    className, draggable,
    disabled, onOpen, onDel, icon, modify_time, create_time, ..._p } = props;
  const [renaming, set_renaming] = useState(renameing);
  const [name, set_name] = useState(__name);

  return (
    <Dropdown
      disabled={disabled}
      triggers={['contextmenu']}
      followPointer
      menu={{
        items: [{
          children: t('rename'),
          title: t('rename'),
          onClick: () => set_renaming(true),
          disabled: !renameable,
        }, {
          children: t('delete'),
          title: t('delete'),
          onClick: onDel,
        }]
      }}>
      <div
        className={classnames(csses.file_raw, disabled ? csses.disbaled : void 0, className)}
        draggable={draggable && !renaming}
        {..._p}
        onDoubleClick={e => {
          e.stopPropagation();
          e.preventDefault();
          if (disabled) return;
          onOpen?.()
        }} >
        <IconButton
          onClick={(e) => {
            interrupt_event(e)
            if (disabled) return;
            onOpen?.()
          }}
          letter={icon}
          onDoubleClick={interrupt_event} />
        <div className={csses.mid_zone}>
          {
            renaming ?
              <input
                value={name}
                onChange={e => {
                  const name = e.target.value.trim()
                  if (name && !filename_ok(name)) return;
                  set_name(e.target.value)
                }}
                draggable={false}
                autoFocus
                onMouseDownCapture={e => e.stopPropagation()}
                onMouseMoveCapture={e => e.stopPropagation()}
                onMouseUpCapture={e => e.stopPropagation()}
                onPointerDownCapture={e => e.stopPropagation()}
                onPointerMoveCapture={e => e.stopPropagation()}
                onPointerUpCapture={e => e.stopPropagation()}
                onDoubleClick={e => interrupt_event(e)}
                onFocus={(e) => e.target.select()}
                onBlur={() => {
                  const _name = name?.trim().replace(/\.*$/, '') || __name
                  if (_name) onNameChanged?.(_name).then(ok => {
                    if (!ok) set_name(__name)
                  })
                  set_name(_name)
                  set_renaming(false)
                }}
                onKeyDown={e => {
                  const el = e.target as HTMLInputElement;
                  if (e.key?.toLowerCase() === 'escape') {
                    set_name(__name);
                    el.blur()
                    e.stopPropagation()
                    e.preventDefault()
                  }
                  if (e.key?.toLowerCase() === 'enter') {
                    el.blur()
                    e.stopPropagation()
                    e.preventDefault()
                  }
                }}
              /> :
              <div
                className={csses.file_name}
                title={name}>
                {name}
              </div>
          }
          <div className={csses.time_view}>
            <span>create: {create_time}</span>
            <span>update: {modify_time}</span>
          </div>
        </div>
        <div className={csses.right_zone}>

        </div>
      </div>
    </Dropdown>
  )
}

