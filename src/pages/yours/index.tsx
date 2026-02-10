/* eslint-disable react-hooks/set-state-in-effect */
import { IconButton } from "@/components/button/IconButton"
import Toast from "@/gimd/Toast"
import { context } from "@/GlobalStore/context"
import { useOSS } from "@/hooks/useOSS"
import type OSS from "ali-oss"
import classnames from "classnames"
import { useContext, useEffect, useState } from "react"
import csses from "./styles.module.scss"

export function YoursPage() {
  const [toast, toast_ctx] = Toast.useToast()
  const { global_value: { user_id, username, nickname } } = useContext(context)
  const [oss, { dir: root_dir }] = useOSS();
  const [cur_dir, set_dir] = useState(root_dir);
  const [prefixes, set_prefixes] = useState<string[]>([]);
  const [objects, set_objects] = useState<OSS.ObjectMeta[]>([]);
  const [pending, set_pending] = useState(false);

  useEffect(() => {
    if (!root_dir || !oss) return;
    let cancelled = false
    set_pending(true)
    oss.listV2({ prefix: root_dir + '/', delimiter: '/' }).then((r) => {
      if (cancelled) return;
      set_dir(root_dir + '/')
      set_objects(r.objects ?? [])
      set_prefixes(r.prefixes ?? [])
    }).finally(() => {
      if (cancelled) return;
      set_pending(false)
    })
    return () => { cancelled = true }
  }, [oss, root_dir])

  const on_click_add = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    if (!oss) return;
    const now = Date.now()
    const name = `info.json`
    set_pending(true)
    oss.put(`${root_dir}/${now}/${name}`, new Blob(["HELLO"], { type: 'application/json; charset=utf-8' }), {
      mime: "application/json",
      headers: {
        "Content-Type": 'application/json',
        "Content-Disposition": `attachment;filename="${encodeURIComponent(name)}"`,
        "x-oss-meta-user-id": '' + user_id,
        "x-oss-meta-username": '' + username,
        "x-oss-meta-nickname": '' + nickname,
      }
    }).then(() => {
      return oss.listV2({ prefix: cur_dir, delimiter: '/' })
    }).then((r) => {
      set_objects(r.objects ?? [])
      set_prefixes(r.prefixes ?? [])
    }).catch(e => {
      console.warn('e:', e)
      toast(e)
    }).finally(() => {
      set_pending(false)
    })
  }
  const on_click_back = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    const l = cur_dir.split('/').filter(Boolean)
    l.pop()
    open_dir(l.join('/') + '/')
  }
  const del_obj = (obj: OSS.ObjectMeta) => {
    if (!oss) return;
    set_pending(true)
    oss.delete(obj.name).then((r) => {
      if (!r) return;
      return oss.listV2({ prefix: cur_dir, delimiter: '/' })
    }).then(r => {
      if (!r) return;
      toast('delete!')
      set_objects(r.objects ?? [])
      set_prefixes(r.prefixes ?? [])
    }).catch(e => {
      console.warn('e:', e)
      toast(e)
    }).finally(() => {
      set_pending(false)
    })
  }
  const del_dir = (prefix: string) => {
    if (!oss) return;
    set_pending(true)

    oss.listV2({ prefix }).then(r => {
      if (!r.objects) return void 0
      const names = r.objects?.map(v => v.name)
      if (!names?.length) return void 0
      return oss.deleteMulti(names)
    }).then((r) => {
      if (!r) return;
      toast('delete!')
      return oss.listV2({ prefix: cur_dir, delimiter: '/' })
    }).then(r => {
      if (!r) return;
      set_objects(r.objects ?? [])
      set_prefixes(r.prefixes ?? [])
    }).catch(e => {
      console.warn('e:', e)
      toast(e)
    }).finally(() => {
      set_pending(false)
    })
  }
  const open_dir = (prefix: string) => {
    if (!oss) return;
    set_pending(true)
    oss.listV2({ prefix, delimiter: '/' }).then((r) => {
      set_dir(prefix)
      set_objects(r.objects ?? [])
      set_prefixes(r.prefixes ?? [])
    }).finally(() => {
      set_pending(false)
    })
  }
  return (
    <div style={{ display: 'flex', flexDirection: 'column', flex: 1, alignItems: 'stretch' }}>
      {toast_ctx}
      <div style={{ display: 'flex', alignItems: 'stretch' }}>
        <IconButton letter="←" disabled={pending || cur_dir === root_dir + '/'} onClick={on_click_back} />
        <div style={{ flex: 1, display: 'flex', alignItems: 'center' }}>
          {cur_dir.substring(root_dir.length + 1)}
        </div>
        <IconButton letter="+" disabled={pending} onClick={on_click_add} />
      </div>
      <div className={classnames(csses.file_list, csses.scrollview)}>
        {prefixes.map(v => {
          return (
            <FileRow
              disabled={pending}
              key={v}
              icon='📂'
              name={v.substring(root_dir.length + 1, v.length - 1)}
              onOpen={() => open_dir(v)}
              onDel={() => del_dir(v)} />
          )
        })}
        {objects.map(v => {
          if (v.name === cur_dir) return;
          return (
            <FileRow
              disabled={pending}
              key={v.name}
              icon='📄'
              name={v.name.substring(cur_dir.length)}
              onOpen={() => { }}
              onDel={() => del_obj(v)} />
          )
        })}
      </div>
    </div >
  )
}
interface IFileRowProps extends React.HTMLAttributes<HTMLDivElement> {
  name?: string;
  onDel?(): void;
  onOpen?(): void;
  deletable?: boolean;
  icon?: string;
  disabled?: boolean;
}
function FileRow(props: IFileRowProps) {
  const { name, deletable = true, disabled, onOpen, onDel, icon, ..._p } = props
  return (
    <div className={classnames(csses.file_raw, disabled ? csses.disbaled : void 0)} {..._p}
      onDoubleClick={e => {
        e.stopPropagation();
        e.preventDefault();
        if (disabled) return;
        onOpen?.()
      }} >
      <IconButton
        onClick={(e) => {
          interrupt(e)
          if (disabled) return;
          onOpen?.()
        }}
        letter={icon}
        onDoubleClick={interrupt} />
      <div className={csses.mid_zone}>
        {name}
      </div>
      <div className={csses.right_zone}>
        {
          deletable ?
            <button
              onDoubleClick={interrupt}
              onClick={e => {
                interrupt(e);
                if (disabled) return;
                onDel?.()
              }}>🗑️</button> : null
        }
      </div>
    </div>
  )
}
const interrupt = (e: React.UIEvent) => {
  e.stopPropagation(); e.preventDefault()
}