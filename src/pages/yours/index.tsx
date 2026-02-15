/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react-hooks/set-state-in-effect */
import { addModRecord } from "@/api/addModRecord"
import { listModPath } from "@/api/listModPath"
import { listModRecords, type IFileInfo } from "@/api/listModRecords"
import img_create_dir from "@/assets/svg/create_dir.svg"
import img_create_file from "@/assets/svg/create_file.svg"
import img_edit from "@/assets/svg/edit.svg"
import img_preview from "@/assets/svg/preview.svg"
import img_publish from "@/assets/svg/publish.svg"
import img_reviewing from "@/assets/svg/reviewing.svg"
import img_unpublish from "@/assets/svg/unpublish.svg"
import { Info } from "@/base/Info"
import { IconButton } from "@/components/button/IconButton"
import { ImagesViewer } from "@/components/images/Viewer"
import { Loading } from "@/components/loading"
import Toast from "@/gimd/Toast"
import GlobalStore from "@/GlobalStore"
import { get_content_disposition } from "@/hooks/ossUploadFiles"
import { ossUploadModRecords } from "@/hooks/ossUploadModRecords"
import { useOSS } from "@/hooks/useOSS"
import { ApiHttp } from "@/network/ApiHttp"
import { Paths } from "@/Paths"
import { file_size_txt } from "@/utils/file_size_txt"
import { interrupt_event } from "@/utils/interrupt_event"
import { LocationParams } from "@/utils/LocationParams"
import { default as classnames, default as classNames } from "classnames"
import dayjs from "dayjs"
import { Fragment, useContext, useEffect, useMemo, useRef, useState } from "react"
import { useTranslation } from "react-i18next"
import { useNavigate } from "react-router"
import { useImmer } from "use-immer"
import { FileRow } from "./FileRow"
import { get_icon, get_icon_title } from "./get_icon"
import { InfoViewModal } from "./InfoViewModal"
import { ModFormModal } from "./ModFormModal"
import { OwnerName } from "./OwnerName"
import csses from "./styles.module.scss"
import { VideoModal } from "./VideoModal"
import { editModRecord } from "@/api/editModRecord"

export default function YoursPage(props: React.HTMLAttributes<HTMLDivElement>) {
  const { t } = useTranslation()
  const [oss, sts] = useOSS();
  const [viewing_video, set_viewing_video] = useState<string>()
  const [viewing_video_open, set_viewing_video_open] = useState<boolean>()
  const [toast, toast_ctx] = Toast.useToast()
  const [path, set_path] = useState<IFileInfo[]>([]);
  const dir: IFileInfo = useMemo(() => path.at(path.length - 1) ?? { id: 0 }, [path])
  const [pending, set_pending] = useState(false);
  const [files, set_files] = useState<IFileInfo[]>([]);
  const [new_dir, set_new_dir] = useState(0);
  const ref_dragging = useRef<IFileInfo | undefined>(void 0);
  const [dragover, set_dragover] = useState<number | undefined>(void 0);
  const [editing_mod, set_editing_mod] = useState<{ open?: boolean, data?: IFileInfo }>({})
  const ref_root = useRef<HTMLDivElement>(null);
  const [progress, set_progress] = useState<[string, number, number]>()
  const { value: { session_id, nickname, username } } = useContext(GlobalStore.context);
  const nav = useNavigate();
  const { search } = LocationParams.useAll();
  const [previewing, set_previewing] = useImmer({ open: false, data: Info.empty(null) })

  const refresh_files = (parent = dir?.id) => {
    set_pending(true)
    listModRecords({ parent })
      .then(r => {
        set_files(r ?? [])
      }).catch(e => {
        toast.error(e)
      }).finally(() => {
        set_pending(false)
      })
  }
  useEffect(() => {
    const path = search.get_numbers('path') ?? []
    const ab = new AbortController();
    set_pending(true)
    if (!path.length) {
      listModRecords({ parent: 0 }, { signal: ab.signal }).then(r => {
        if (ab.signal.aborted) return;
        set_path([])
        set_files(r ?? [])
      }).finally(() => {
        if (ab.signal.aborted) return;
        set_pending(false)
      })
      return () => ab.abort()
    }
    listModPath({ path }, { signal: ab.signal }).then(r => {
      if (ab.signal.aborted) return;
      set_path(r)
      return listModRecords({ parent: r[r.length - 1].id }, { signal: ab.signal })
    }).catch(e => {
      if (ab.signal.aborted) return;
      toast.error(e);
      nav({ search: search.clone().delele('path').to_query() })
    }).then(r => {
      if (ab.signal.aborted) return;
      set_files(r ?? [])
    }).finally(() => {
      if (ab.signal.aborted) return;
      set_pending(false)
    })
    return () => ab.abort()
  }, [nav, search, toast])

  useEffect(() => {
    if (!session_id) nav(Paths.All.main)
  }, [session_id, nav])

  const add_dir = (parent: number = 0, type?: 'mod' | 'omod') => {
    set_pending(true)
    addModRecord({ name: '' + Date.now(), parent, type }).then((r) => {
      set_new_dir(r);
      return refresh_files(parent)
    }).catch(e => {
      toast.error(e)
    }).finally(() => {
      set_pending(false)
    })
  }

  const del_file = (target: IFileInfo) => {
    set_pending(true)
    ApiHttp.delete(`${API_BASE}lfwm/delete`, { id: target.id }).then((r) => {
      toast.success(`deleted count: ${r.data}`)
      return refresh_files()
    }).catch(e => {
      toast.error(e)
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
    const imgs = files.filter(v => v.url && v.content_type?.startsWith('image/')).map(v => ({
      url: v.url!,
      alt: v.name
    }))
    const idx = imgs.findIndex(v => v?.url === target.url)
    ImagesViewer.open(imgs, idx)
  }

  const edit_mod = (target: IFileInfo) => {
    set_editing_mod({ open: true, data: target });
  }

  const preview_mod = async ({ owner_id, id, type }: IFileInfo) => {
    // TODO
    if (type != 'mod') return new Error('TODO');
    if (!id || !owner_id) return new Error('TODO')
    if (!sts?.base) return new Error('TODO')
    // const { info_obj_path } = get_mod_paths_names(owner_id, id);
    // const info = await fetch_info(sts.base + info_obj_path, null, '', {})
    // set_previewing({ open: true, data: info })
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
    if (!target) {
      const s = search.clone().delele('path').to_query()
      return nav({ search: s });
    }
    const path = [target.path, target.id].filter(Boolean).join()
    const s = search.clone().set('path', path).to_query();
    nav({ search: s })
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
      ApiHttp.post(`${API_BASE}lfwm/move`, null, {
        id: dragging.id,
        parent: dragover,
      }).then(() => {
        return true
      }).catch(e => {
        toast.error(e)
        return false
      }).then(ok => {
        if (!ok) return;
        return refresh_files(dir.id)
      }).catch(e => {
        toast.error(e)
      }).finally(() => {
        set_pending(false)
      })
    } else if (e.dataTransfer.types.includes('Files')) {
      set_dragover(void 0);
      set_pending(true);
      ossUploadModRecords({
        mod_id: me.id,
        files: Array.from(e.dataTransfer.files),
        oss,
        sts,
        progress: (progress, info) => set_progress((progress >= 1 || !info) ? void 0 : [info.file.name, progress, info.fileSize])
      }).then(() => {
        return (dir.id !== me.id) || (!dir != !me.id)
      }).catch(e => {
        toast.error(e)
        return false
      }).then(ok => {
        if (!ok) return
        return refresh_files(me.parent)
      }).catch(e => {
        toast.error(e)
      }).finally(() => {
        set_pending(false)
      })
    }
  }

  const unpublish = (me: IFileInfo) => {
    set_pending(true)
    ApiHttp.post(`${API_BASE}lfwm/unpublish`, {}, { id: me.id }).then(r => {
      return r.data && refresh_files()
    }).finally(() => {
      set_pending(false)
    })
  }

  const publish = (me: IFileInfo) => {
    set_pending(true)
    ApiHttp.post(`${API_BASE}lfwm/publish`, {}, { id: me.id }).then(r => {
      return r.data && refresh_files()
    }).finally(() => {
      set_pending(false)
    })
  }

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
          disabled={pending || !path.length}
          onClick={e => {
            interrupt_event(e)
            open_dir(path[path.length - 2])
          }} />
        <div className={classnames(csses.breadcrumb, csses.noscrollbar)}>
          <Fragment>
            <IconButton
              title={t('return_to_home_dir')}
              onClick={(e) => {
                interrupt_event(e)
                open_dir()
              }}
              className={classnames(csses.breadcrumb_item, dragover == 0 ? csses.dragover : void 0)}
              onDragOver={e => onDragOver(e, { id: 0 })}
              onDrop={e => onDrop(e, { id: 0 })}>
              {nickname || username || '~'}
            </IconButton>
            <div>/</div>
          </Fragment>
          {
            path.map((me, idx, arr) => {
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
            add_dir(dir.id)
          }} />
        <IconButton
          img={img_create_file}
          disabled={pending}
          title={t("create_mod_info")}
          onClick={e => {
            interrupt_event(e)
            add_dir(dir.id, 'mod')
          }} />
      </div>
      <div
        className={classnames(csses.file_list, csses.scrollview, dragover == dir.id ? csses.dragover : void 0)}
        onDragOver={e => onDragOver(e, dir)}
        onDragLeave={() => set_dragover(void 0)}
        onDrop={e => onDrop(e, dir)}>
        {!pending && !files.length ? <div style={{ margin: 'auto' }}>empty</div> : null}
        {
          files.map(me => {
            return (
              <FileRow
                disabled={pending}
                key={'' + me.id + me.name + me.create_time + me.modify_time}
                icon={get_icon(me)}
                icon_title={get_icon_title(me)}
                name={me.name}
                className={classnames(dragover == me.id ? csses.dragover : void 0)}
                modify_time={me.modify_time ? dayjs(me.modify_time).format('YYYY-MM-DD HH:mm:ss.SSS') : void 0}
                create_time={me.create_time ? dayjs(me.create_time).format('YYYY-MM-DD HH:mm:ss.SSS') : void 0}
                renameing={new_dir == me.id}
                draggable
                desc={me.size ? `Size: ${file_size_txt(me.size)}` : `Type: ${me.type ?? 'dir'}`}
                onMouseDown={e => {
                  const el = (e.target as HTMLElement);
                  if (el.tagName !== 'DIV') {
                    console.log(el.tagName)
                    e.stopPropagation()
                    e.preventDefault()
                  }
                }}
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
                      onClick={() => edit_mod(me)} />
                  }
                  {me.type !== 'mod' ? null :
                    <IconButton
                      img={img_preview}
                      title={t('preview_mod_info')}
                      disabled={pending}
                      onClick={() => preview_mod(me)} />
                  }
                  {(me.type !== 'mod' || me.status) ? null :
                    <IconButton
                      img={img_publish}
                      title={t('publish_mod')}
                      disabled={pending}
                      onClick={() => publish(me)} />
                  }
                  {(me.type !== 'mod' || !me.status) ? null :
                    <IconButton
                      img={img_unpublish}
                      title={t('unpublish_mod')}
                      disabled={pending}
                      onClick={() => unpublish(me)} />
                  }
                  {(me.type !== 'mod' || me.status !== 'reviewing') ? null :
                    <IconButton
                      disabled
                      img={img_reviewing}
                      title={t('mod_reviewing')} />
                  }
                </>}
                onDragOver={e => onDragOver(e, me)}
                onDrop={e => onDrop(e, me)}
                onNameChanged={async (name) => {
                  if (name === me.name) {
                    if (new_dir == me.id && (me.type == 'mod' || me.type == 'omod')) {
                      edit_mod(me)
                    }
                    set_new_dir(0)
                    return true;
                  }
                  let { oss_name } = me;
                  if (oss_name && !oss)
                    return false;
                  set_pending(true)
                  if (oss_name && oss) {
                    if (oss_name.startsWith('/')) oss_name = oss_name.substring(1)
                    const content_disposition = get_content_disposition(name);
                    const ok = await oss.copy(oss_name, oss_name, {
                      headers: { 'content-disposition': content_disposition }
                    }).then(() => {
                      return true
                    }).catch(e => {
                      set_pending(false)
                      toast.error(e)
                      return false
                    })
                    if (!ok) return ok
                  }
                  const ok = await editModRecord({
                    id: me.id,
                    name: name
                  }).then(() => {
                    toast.success('done')
                    me.name = name;
                    if (new_dir == me.id && me.type == 'mod') {
                      edit_mod(me)
                    }
                    set_new_dir(0)
                    return true
                  }).catch(e => {
                    set_new_dir(0)
                    console.log(e)
                    toast.error(e)
                    return false
                  }).finally(() => {
                    set_pending(false)
                  })
                  return ok;
                }}
                onOpen={() => open_any(me)}
                onDel={() => del_file(me)}
                onDetail={() => alert(JSON.stringify(me, null, 2))} />
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
      <InfoViewModal
        open={previewing.open}
        onClose={() => set_previewing(d => { d.open = false; })}
        afterClose={() => set_previewing(d => { d.data = Info.empty() })}
        data={previewing.data}
      />
    </div>
  )
}


