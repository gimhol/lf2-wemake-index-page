import img_download from "@/assets/svg/download.svg"
import { IconButton } from "@/components/button/IconButton"
import { Dropdown } from "@/gimd/Dropdown"
import { filename_ok } from "@/utils/filename_ok"
import { interrupt_event } from "@/utils/interrupt_event"
import { open_link } from "@/utils/open_link"
import classnames from "classnames"
import { useState, type ReactNode } from "react"
import { useTranslation } from "react-i18next"
import csses from "./FileRow.module.scss"
import type { IMenuItem } from "@/gimd/Menu"
export interface IFileRowProps extends React.HTMLAttributes<HTMLDivElement> {
  name?: string;
  modify_time?: ReactNode;
  create_time?: ReactNode;
  onNameChanged?(v: string): Promise<boolean>;
  renameable?: boolean;
  onDel?(): void;
  onOpen?(): void;
  deletable?: boolean;
  icon?: ReactNode;
  disabled?: boolean;
  renameing?: boolean;
  desc?: ReactNode;
  owner?: ReactNode;
  download?: string;
  actions?: ReactNode;
  icon_title?: string;
  menu?: IMenuItem[];
}
export function FileRow(props: IFileRowProps) {
  const { t } = useTranslation()
  const {
    name: __name,
    renameable = true,
    onNameChanged,
    renameing,
    className, draggable, desc, owner, download, actions,
    disabled, menu, onOpen, onDel, icon, icon_title, modify_time, create_time, ..._p } = props;
  const [renaming, set_renaming] = useState(renameing);
  const [name, set_name] = useState(__name);

  return (
    <Dropdown
      disabled={disabled && !menu?.length}
      triggers={['contextmenu']}
      followPointer
      menu={{
        items: [{
          children: t('rename'),
          title: t('rename'),
          onClick: () => set_renaming(true),
          disabled: !renameable,
        }, ...(menu || []), {
          children: <span style={{ color: 'red' }}>{t('delete')}</span>,
          title: t('delete'),
          onClick: onDel,
        }, ]
      }}>
      <div
        className={classnames(csses.file_list_item, disabled ? csses.disbaled : void 0, className)}
        draggable={draggable && !renaming}
        {..._p}
        onDoubleClick={e => {
          e.stopPropagation();
          e.preventDefault();
          if (disabled) return;
          onOpen?.()
        }}>
        <IconButton
          disabled={disabled}
          className={classnames(csses.icon_btn)}
          onClick={(e) => { interrupt_event(e); onOpen?.() }}
          title={icon_title}
          icon={icon}
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
                  if (_name) onNameChanged?.(_name).catch(() => false).then(ok => {
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
          <div
            className={csses.action_zone}
            onClick={interrupt_event}
            onDoubleClick={interrupt_event}>
            {actions}
            {download ?
              <IconButton
                draggable={false}
                disabled={disabled}
                icon={img_download}
                title={download}
                onClick={() => open_link(download)} /> : null}
          </div>

        </div>
        <div className={csses.right_zone}>
          <div className={csses.desc_view}>
            {owner ? <div className={csses.desc_txt}>{owner}</div> : ''}
            {desc ? <div className={csses.desc_txt}>{desc}</div> : ''}
          </div>
          <div className={csses.desc_view}>
            <div className={csses.desc_txt}>Create: {create_time}</div>
            <div className={csses.desc_txt}>Update: {modify_time}</div>
          </div>
        </div>
      </div>
    </Dropdown>
  )
}

