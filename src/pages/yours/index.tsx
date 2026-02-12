/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react-hooks/set-state-in-effect */
import { addModFile } from "@/api/addModFile"
import { listModFiles, type IFileInfo } from "@/api/listModFiles"
import img_create_dir from "@/assets/svg/create_dir.svg"
import img_create_file from "@/assets/svg/create_file.svg"
import img_edit from "@/assets/svg/edit.svg"
import img_preview from "@/assets/svg/preview.svg"
import img_publish from "@/assets/svg/publish.svg"
import img_unpublish from "@/assets/svg/unpublish.svg"
import { IconButton } from "@/components/button/IconButton"
import { Loading } from "@/components/loading/LoadingImg"
import Toast from "@/gimd/Toast"
import { useGlobalValue } from "@/GlobalStore/useGlobalValue"
import { get_content_disposition } from "@/hooks/ossUploadFiles"
import { ossUploadModFiles } from "@/hooks/ossUploadModFiles"
import { useOSS } from "@/hooks/useOSS"
import { ApiHttp } from "@/network/ApiHttp"
import { Paths } from "@/Paths"
import { file_size_txt } from "@/utils/file_size_txt"
import { interrupt_event } from "@/utils/interrupt_event"
import { default as classnames, default as classNames } from "classnames"
import dayjs from "dayjs"
import { Fragment, useEffect, useRef, useState } from "react"
import { useTranslation } from "react-i18next"
import { useNavigate } from "react-router"
import Viewer from 'viewerjs'
import 'viewerjs/dist/viewer.min.css'
import { FileRow } from "./FileRow"
import { get_icon } from "./get_icon"
import { ModFormModal } from "./ModFormModal"
import { OwnerName } from "./OwnerName"
import csses from "./styles.module.scss"
import { VideoModal } from "./VideoModal"

export default function YoursPage(props: React.HTMLAttributes<HTMLDivElement>) {
  const { t } = useTranslation()
  const [toast, toast_ctx] = Toast.useToast()
  const [dirs, set_dirs] = useState<IFileInfo[]>([]);
  const [pending, set_pending] = useState(false);
  const [files, set_files] = useState<IFileInfo[]>([]);
  const [new_dir, set_new_dir] = useState(0);
  const dir: IFileInfo | undefined = dirs.at(dirs.length - 1)
  const ref_dragging = useRef<IFileInfo | undefined>(void 0);
  const [dragover, set_dragover] = useState<number | undefined>(void 0);
  const [editing_mod, set_editing_mod] = useState<{ open?: boolean, data?: IFileInfo }>({})
  const ref_root = useRef<HTMLDivElement>(null);
  const [progress, set_progress] = useState<[string, number, number]>()
  const { global_value: { session_id } } = useGlobalValue();
  const nav = useNavigate()
  useEffect(() => {
    if (!session_id) nav(Paths.All.main)
  }, [session_id, nav])

  useEffect(() => {
    const el = ref_root.current
    if (!el) return;
  }, [])

  useEffect(() => {
    set_pending(true)
    const ab = new AbortController();
    listModFiles({}, { signal: ab.signal })
      .then(r => {
        if (ab.signal.aborted) return;
        set_files(r ?? [])
      }).catch(e => {
        if (ab.signal.aborted) return;
        toast(e)
      }).finally(() => {
        if (ab.signal.aborted) return;
        set_pending(false)
      })
    return () => { ab.abort() }
  }, [toast])

  const add_dir = (parent: number = 0, type?: 'mod') => {
    set_pending(true)
    addModFile({ name: '' + Date.now(), parent, type }).then((r) => {
      set_new_dir(r);
      return listModFiles({ parent })
    }).then(r => {
      set_files(r ?? [])
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
      return listModFiles({ parent: target.parent })
    }).then(r => {
      set_files(r ?? [])
    }).catch(e => {
      toast(e)
    }).finally(() => {
      set_pending(false)
    })
  }
  const open_any = (target: IFileInfo) => {
    if (target.type == 'mod' || !target.type) {
      open_dir(target)
    } else if (target.type === 'file') {
      open_file(target)
    } else {
      alert('failed! type=' + target.type)
    }
  }
  const open_image = (target: IFileInfo) => {

    const imgs = files.map(file => {
      if (!file.content_type?.startsWith('image/')) return;
      if (!file.url) return;
      const img = document.createElement('img')
      img.src = file.url; img.width = 1; img.height = 1;
      return img
    }).filter(Boolean) as HTMLImageElement[]
    const idx = imgs.findIndex(v => v?.src === target.url)
    const div = document.createElement('div')
    div.append(...imgs)
    new Viewer(div)
    imgs[idx].click()
  }
  const edit_mod_info = (target: IFileInfo) => {
    set_editing_mod({ open: true, data: target });
  }
  const open_file = (target: IFileInfo) => {
    if (target.content_type?.startsWith('image/') && target.url) {
      open_image(target)
    } else if (target.content_type?.startsWith('video/') && target.url) {
      set_viewing_video(target.url)
      set_viewing_video_open(true)
    }
  }
  const open_dir = (target?: IFileInfo) => {
    set_pending(true)
    listModFiles({ parent: target?.id })
      .then(r => {
        set_files(r ?? [])
        if (!target) {
          set_dirs([]);
          return
        }
        const mine_idx = dirs.findIndex(v => v.id === target.id)
        if (mine_idx >= 0) {
          set_dirs(dirs.slice(0, mine_idx + 1));
          return;
        }
        if (target.parent === 0) {
          set_dirs([target]);
          return;
        }
        const praent_idx = dirs.findIndex(v => v.id === target.parent)
        if (praent_idx >= 0) {
          const next = dirs.slice(0, praent_idx + 1)
          next.push(target)
          set_dirs(next);
          return;
        }
      }).catch(e => {
        toast(e)
      }).finally(() => {
        set_pending(false)
      })
  }
  const onDragOver = (e: React.DragEvent, me: IFileInfo) => {
    const not_allow = () => { e.stopPropagation() }
    if (pending || typeof me.id !== 'number') return not_allow();
    switch (me.type) {
      case 'dir': case 'mod': case null: case void 0: break
      default: return not_allow();
    }
    const dragging = ref_dragging.current
    if (dragging) {
      if (dragging.id == me.id) return not_allow();
      if (dragging.parent == me.id) return not_allow();
      set_dragover(me.id);
      interrupt_event(e);
      return;
    }
    if (e.dataTransfer.types.includes('Files')) {
      set_dragover(me.id);
      interrupt_event(e);
      return;
    }
    not_allow()
    return;
  }
  const [oss, sts] = useOSS();
  const onDrop = (e: React.DragEvent, me: IFileInfo) => {
    const not_allow = () => {
      set_dragover(void 0);
      e.stopPropagation();
      e.preventDefault()
    }
    if (pending || typeof me.id !== 'number') return not_allow()
    const dragging = ref_dragging.current
    if (dragging) {
      if (dragging.id == me.id || dragging.parent == me.id)
        return not_allow();
      interrupt_event(e);
      set_dragover(void 0);
      set_pending(true);
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
        return listModFiles({ parent: dir?.id })
      }).then(r => {
        if (r) set_files(r ?? [])
      }).catch(e => {
        toast(e)
      }).finally(() => {
        set_pending(false)
      })
    } else if (e.dataTransfer.types.includes('Files')) {
      set_dragover(void 0);
      set_pending(true);
      ossUploadModFiles({
        mod_id: me.id,
        files: Array.from(e.dataTransfer.files),
        oss,
        sts,
        progress: (progress, info) => set_progress((progress >= 1 || !info) ? void 0 : [info.file.name, progress, info.fileSize])
      }).then(() => {
        return (dir?.id !== me.id) || (!dir != !me.id)
      }).catch(e => {
        toast.error(e)
        return false
      }).then(ok => {
        if (!ok) return
        return listModFiles({ parent: me.parent })
      }).then((r) => {
        if (r) set_files(r)
      }).catch(e => {
        toast.error(e)
      }).finally(() => {
        set_pending(false)
      })
    }
  }
  const [viewing_video, set_viewing_video] = useState<string>()
  const [viewing_video_open, set_viewing_video_open] = useState<boolean>()
  return (
    <div {...props} className={classNames(csses.mine_page, props.className)} style={props.style} ref={ref_root} >
      {toast_ctx}
      <VideoModal
        open={!!(viewing_video_open && viewing_video)}
        src={viewing_video}
        onClose={() => set_viewing_video_open(void 0)}
        afterClose={() => set_viewing_video(void 0)} />

      <div className={csses.file_list_head}>
        <IconButton
          letter="←"
          disabled={pending || !dirs.length}
          onClick={e => {
            interrupt_event(e)
            open_dir(dirs[dirs.length - 2])
          }} />
        <div className={classnames(csses.breadcrumb, csses.noscrollbar)}>
          <Fragment >
            <button
              title={t('return_to_home_dir')}
              onClick={(e) => {
                interrupt_event(e)
                open_dir()
              }}
              className={classnames(csses.breadcrumb_item, dragover == 0 ? csses.dragover : void 0)}
              onDragOver={e => onDragOver(e, { id: 0 })}
              onDrop={e => onDrop(e, { id: 0 })}>
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
                    title={t('goto_dir_$1').replace('$1', me.name!)}
                    disabled={arr.length == idx + 1}
                    onClick={(e) => {
                      interrupt_event(e);
                      open_dir(me)
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
          title={t("create_dir")}
          onClick={e => {
            interrupt_event(e)
            add_dir(dir?.id)
          }} />
        <IconButton
          img={img_create_file}
          disabled={pending}
          title={t("create_mod_info")}
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
                icon={get_icon(me)}
                name={me.name}
                className={classnames(dragover == me.id ? csses.dragover : void 0)}
                modify_time={me.modify_time ? dayjs(me.modify_time).format('YYYY-MM-DD HH:mm:ss.SSS') : void 0}
                create_time={me.create_time ? dayjs(me.create_time).format('YYYY-MM-DD HH:mm:ss.SSS') : void 0}
                renameing={new_dir == me.id}
                draggable
                desc={me.size ? `Size: ${file_size_txt(me.size)}` : `Type: ${me.type ?? 'dir'}`}
                onDragStart={(e) => {
                  if (pending) interrupt_event(e)
                  ref_dragging.current = me;
                }}
                onDragEnd={(e) => {
                  if (pending) interrupt_event(e)
                  ref_dragging.current = void 0;
                  set_dragover(void 0)
                }}
                owner={<OwnerName owner_id={me.owner_id} />}
                download={me.type == 'file' ? me.url : void 0}
                actions={<>
                  {me.type !== 'mod' ? null :
                    <IconButton
                      img={img_edit}
                      title={t('edit_mod_info')}
                      disabled={pending}
                      onClick={(e) => { interrupt_event(e); edit_mod_info(me) }}
                      onDoubleClick={(e) => { interrupt_event(e) }} />
                  }
                  {me.type !== 'mod' ? null :
                    <IconButton
                      img={img_preview}
                      title={t('preview_mod_info')}
                      disabled={pending}
                      onClick={(e) => { interrupt_event(e); edit_mod_info(me) }}
                      onDoubleClick={(e) => { interrupt_event(e) }} />
                  }
                  {me.type !== 'mod' ? null :
                    <IconButton
                      img={img_publish}
                      title={t('publish')}
                      disabled={pending}
                      onClick={(e) => { interrupt_event(e); edit_mod_info(me) }}
                      onDoubleClick={(e) => { interrupt_event(e) }} />
                  }
                  {me.type !== 'mod' ? null :
                    <IconButton
                      img={img_unpublish}
                      title={t('unpublish')}
                      disabled={pending}
                      onClick={(e) => { interrupt_event(e); edit_mod_info(me) }}
                      onDoubleClick={(e) => { interrupt_event(e) }} />
                  }
                </>}
                onDragOver={e => onDragOver(e, me)}
                onDrop={e => onDrop(e, me)}
                onNameChanged={async (name) => {
                  if (name === me.name) {
                    if (new_dir == me.id && me.type == 'mod') {
                      edit_mod_info(me)
                    }
                    set_new_dir(0)
                    return true;
                  }
                  const { oss_name } = me;
                  if (oss_name && !oss)
                    return false;

                  set_pending(true)
                  if (oss_name && oss) {
                    const content_disposition = get_content_disposition(name);
                    console.log('oss_name:', oss_name)
                    console.log('content_disposition:', content_disposition)
                    const meta: any = { ['content-disposition']: content_disposition }
                    const ok = await oss.putMeta(oss_name, meta, {})
                      .then(() => {
                        return true
                      }).catch(e => {
                        set_pending(false)
                        toast.error(e)
                        return false
                      })
                    if (!ok) return ok
                  }

                  const ok = await ApiHttp.post(`${API_BASE}lf2wmods/save`, null, {
                    id: me.id,
                    name: name
                  }).then(() => {
                    toast.success('done')
                    me.name = name;
                    if (new_dir == me.id && me.type == 'mod') {
                      edit_mod_info(me)
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
                onOpen={() => open_any(me)}
                onDel={() => del_file(me)} />
            )
          })}
        <ModFormModal
          mod_id={editing_mod?.data?.id}
          open={editing_mod?.open}
          onClose={() => set_editing_mod(p => ({ ...p, open: false }))}
          afterClose={() => set_editing_mod({})} />
      </div>
      {
        progress ?
          <div className={csses.file_list_foot}>
            <div>uploading: {progress[0]}</div>
            <div>progress: {(100 * progress[1]).toFixed(2)}%</div>
            <div>size: {file_size_txt(progress[2])}</div>
          </div> : null
      }

    </div>
  )
}


