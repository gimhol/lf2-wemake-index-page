/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react-hooks/set-state-in-effect */
import { IconButton } from "@/components/button/IconButton"
import { Loading } from "@/components/loading/LoadingImg"
import Toast from "@/gimd/Toast"
import { ApiHttp } from "@/network/ApiHttp"
import { interrupt_event } from "@/utils/interrupt_event"
import classnames from "classnames"
import dayjs from "dayjs"
import { Fragment, useEffect, useRef, useState } from "react"
import { FileRow } from "./FileRow"
import csses from "./styles.module.scss"
import img_create_dir from "@/assets/svg/create_dir.svg"
import img_create_file from "@/assets/svg/create_file.svg"
import { Mask } from "@/components/mask"
import { ModFormView } from "../main/ModFormView"
interface IFileInfo {
  id?: number;
  create_time?: string;
  modify_time?: string;
  owner_id?: number;
  name?: string;
  deleted?: number;
  parent?: number;
  path?: string;
  type?: string;
}

export function YoursPage() {
  const [toast, toast_ctx] = Toast.useToast()
  const [dirs, set_dirs] = useState<IFileInfo[]>([]);
  const [pending, set_pending] = useState(false);
  const [files, set_files] = useState<IFileInfo[]>([]);
  const [new_dir, set_new_dir] = useState(0);
  const dir: IFileInfo | undefined = dirs.at(dirs.length - 1)
  const ref_dragging = useRef<IFileInfo | undefined>(void 0);
  const [dragover, set_dragover] = useState<number | undefined>(void 0);
  const [, set_editing_mod_form] = useState<IFileInfo | undefined>(void 0)
  const [mod_form_open, set_mod_form_open] = useState(false)

  useEffect(() => {
    set_pending(true)
    const ab = new AbortController();
    ApiHttp.post(`${API_BASE}lf2wmods/mine`, null, {}, { signal: ab.signal })
      .then(r => {
        if (ab.signal.aborted) return;
        set_files(r.data ?? [])
      }).catch(e => {
        if (ab.signal.aborted) return;
        toast(e)
      }).finally(() => {
        if (ab.signal.aborted) return;
        set_pending(false)
      })
    return () => { ab.abort() }
  }, [toast])

  const add_dir = (parent: number = 0, type?: string) => {
    set_pending(true)
    ApiHttp.post(`${API_BASE}lf2wmods/create`, null, {
      name: '' + Date.now(), parent, type
    }).then((r) => {
      set_new_dir(r.data);
      return ApiHttp.post(`${API_BASE}lf2wmods/mine`, null, { parent })
    }).then(r => {
      set_files(r.data ?? [])
    }).catch(e => {
      toast(e)
    }).finally(() => {
      set_pending(false)
    })
  }
  const del_file = (target: IFileInfo) => {
    set_pending(true)
    ApiHttp.delete(`${API_BASE}lf2wmods/delete`, { id: target.id }).then((r) => {
      toast.success(`deleted count: ${r.data}`)
      return ApiHttp.post(`${API_BASE}lf2wmods/mine`, null, { parent: target.parent })
    }).then(r => {
      set_files(r.data ?? [])
    }).catch(e => {
      toast(e)
    }).finally(() => {
      set_pending(false)
    })
  }
  const open_file = (target: IFileInfo) => {
    if (target.id === dir?.id) return;
    if (target.type === 'mod') {
      set_mod_form_open(true)
      set_editing_mod_form(target);
      return
    }

    set_pending(true)
    ApiHttp.post(`${API_BASE}lf2wmods/mine`, null, { parent: target.id })
      .then(r => {
        set_dirs([...dirs, target])
        set_files(r.data ?? [])
      }).catch(e => {
        toast(e)
      }).finally(() => {
        set_pending(false)
      })
  }
  const open_dir = (id?: number) => {
    if (id === dir?.id) return;
    set_pending(true)
    ApiHttp.post(`${API_BASE}lf2wmods/mine`, null, { parent: id })
      .then(r => {
        if (!id) {
          set_dirs([])
        } else {
          set_dirs(prev => {
            const idx = prev.findIndex(v => v.id === id)
            return prev.slice(0, idx + 1)
          })
        }
        set_files(r.data ?? [])
      }).catch(e => {
        toast(e)
      }).finally(() => {
        set_pending(false)
      })
  }
  const onDragOver = (e: React.DragEvent, me?: IFileInfo) => {
    if (pending) interrupt_event(e)
    const dragging = ref_dragging.current
    if (!dragging || dragging.id == me?.id || dragging.parent == me?.id) return;
    interrupt_event(e);
    set_dragover(me?.id || 0);
  }
  const onDrop = (e: React.DragEvent, me?: IFileInfo) => {
    if (pending) interrupt_event(e)
    const dragging = ref_dragging.current
    if (!dragging || dragging.id == me?.id || dragging.parent == me?.id) return;
    interrupt_event(e);
    set_dragover(void 0);
    set_pending(true)
    ApiHttp.post(`${API_BASE}lf2wmods/move`, null, {
      id: dragging.id,
      parent: dragover,
    }).then(() => {
      return true
    }).catch(e => {
      toast(e)
      return false
    }).then(ok => {
      if (!ok) return;
      return ApiHttp.post(`${API_BASE}lf2wmods/mine`, null, { parent: dir?.id })
    }).then(r => {
      if (r) set_files(r.data ?? [])
    }).catch(e => {
      toast(e)
    }).finally(() => {
      set_pending(false)
    }).finally(() => {
      set_pending(false)
    })
  }

  return (
    <div className={csses.mine_page}>
      {toast_ctx}
      <div className={csses.file_list_head}>
        <IconButton
          letter="←"
          disabled={pending || !dirs.length}
          onClick={e => {
            interrupt_event(e)
            open_dir(dir?.parent)
          }} />
        <div className={classnames(csses.breadcrumb, csses.noscrollbar)}>
          <Fragment >
            <button onClick={(e) => {
              interrupt_event(e)
              open_dir()
            }}
              className={classnames(csses.breadcrumb_item, dragover == 0 ? csses.dragover : void 0)}
              onDragOver={e => onDragOver(e)}
              onDrop={e => onDrop(e)}>
              home
            </button>
            <div>/</div>
          </Fragment>
          {
            dirs.map((me, idx, arr) => {
              return (
                <Fragment key={me.id}>
                  <button
                    className={classnames(csses.breadcrumb_item, dragover == me.id ? csses.dragover : void 0)}
                    disabled={arr.length == idx + 1}
                    onClick={(e) => {
                      interrupt_event(e);
                      open_dir(me.id)
                    }}
                    onDragOver={e => onDragOver(e, me)}
                    onDrop={e => onDrop(e, me)}>
                    {me.name}
                  </button>
                  <div>/</div>
                </Fragment>
              )
            })
          }
        </div>
        <Loading loading={pending} style={{ alignSelf: 'center' }} />
        <IconButton
          img={img_create_dir}
          disabled={pending}
          onClick={e => {
            interrupt_event(e)
            add_dir(dir?.id)
          }} />
        <IconButton
          img={img_create_file}
          disabled={pending}
          onClick={e => {
            interrupt_event(e)
            add_dir(dir?.id, 'mod')
          }} />
      </div>
      <div className={classnames(csses.file_list, csses.scrollview)} draggable={false}>
        {!pending && !files.length ? <div style={{ margin: 'auto' }}>empty</div> : null}
        {
          files.map(me => {
            return (
              <FileRow
                disabled={pending}
                key={'' + me.id + me.name + me.create_time + me.modify_time}
                icon={me.type == 'mod' ? '📄' : '📂'}
                name={me.name}
                className={classnames(dragover == me.id ? csses.dragover : void 0)}
                modify_time={me.modify_time ? dayjs(me.modify_time).format('YYYY-MM-DD HH:mm:ss.SSS') : void 0}
                create_time={me.create_time ? dayjs(me.create_time).format('YYYY-MM-DD HH:mm:ss.SSS') : void 0}
                renameing={new_dir == me.id}
                draggable
                onDragStart={(e) => {
                  if (pending) interrupt_event(e)
                  ref_dragging.current = me;
                }}
                onDragEnd={(e) => {
                  if (pending) interrupt_event(e)
                  ref_dragging.current = void 0;
                  set_dragover(void 0)
                }}
                onDragOver={e => onDragOver(e, me)}
                onDrop={e => onDrop(e, me)}
                onNameChanged={async (name) => {
                  if (name === me.name) {
                    if (new_dir == me.id && me.type == 'mod') {
                      set_mod_form_open(true)
                      set_editing_mod_form(me);
                    }
                    set_new_dir(0)
                    return true;
                  }
                  set_pending(true)
                  const ok = await ApiHttp.post(`${API_BASE}lf2wmods/save`, null, {
                    id: me.id,
                    name: name
                  }).then(() => {
                    toast.success('done')
                    me.name = name;
                    if (new_dir == me.id && me.type == 'mod') {
                      set_mod_form_open(true)
                      set_editing_mod_form(me);
                    }
                    set_new_dir(0)
                    return true
                  }).catch(e => {
                    set_new_dir(0)
                    console.log(e)
                    toast(e)
                    return false
                  }).finally(() => {
                    set_pending(false)
                  })
                  return ok;
                }}
                onOpen={() => open_file(me)}
                onDel={() => del_file(me)} />
            )
          })}
        <Mask
          container={() => document.body}
          open={mod_form_open}
          onClose={() => set_mod_form_open(false)}
          afterClose={() => set_editing_mod_form(void 0)}>
          <ModFormView />
          <IconButton
            style={{ position: 'absolute', right: 10, top: 10 }}
            letter='✖︎'
            onClick={() => set_mod_form_open(false)} />
        </Mask>
      </div>
    </div >
  )
}