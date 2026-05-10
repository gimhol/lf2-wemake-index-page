/* eslint-disable react-hooks/set-state-in-effect */
import { Paths } from "@/Paths"
import { LangButton } from "@/components/LangButton"
import { Loading } from "@/components/loading"
import Toast from "@/gimd/Toast"
import { useCanGoBack } from "@/hooks/useCanGoBack"
import { useContext, useEffect, useMemo, useState } from "react"
import { useTranslation } from "react-i18next"
import { useLocation, useNavigate, useParams } from "react-router"
import { useImmer } from "use-immer"
import { MainContext } from "../main/main_context"
import { get_mod, type IMod } from "../yours/get_mod"
import { curr_list_like, InfoView, type ListLike } from "./InfoView"
import csses from "./index.module.scss"
let __id = 0;
export default function InfoViewPage() {
  const { i18n } = useTranslation()
  const lang = i18n.language.toLowerCase().startsWith('zh') ? 'zh' : 'en';
  const { info, record } = useContext(MainContext)
  const { id: info_id } = useParams()
  const location = useLocation();
  const is_root = Paths.All.Info.replace(':id', '' + info_id) === location.pathname
  const open = is_root || !(info?.subs?.length)
  const [loading, set_loading] = useState(false)
  const [mod, set_mod] = useImmer<IMod | undefined>(void 0)
  const canGoBack = useCanGoBack()

  useEffect(() => {
    if (!info_id || !is_root) {
      set_mod(void 0);
      set_loading(false);
      return
    }
    const ab = new AbortController();
    set_loading(true)
    get_mod({ mod_id: Number(info_id), lang, signal: ab.signal }).then(r => {
      if (ab.signal.aborted) return;
      set_mod(r)
    }).catch(e => {
      if (ab.signal.aborted) return;
      Toast.error(e)
    }).finally(() => {
      if (ab.signal.aborted) return;
      set_loading(false)
    })
    return () => ab.abort('[page/info] useEffect leave')
  }, [info_id, set_mod, lang, is_root])

  const nav = useNavigate();
  const [margin_top, set_margin_top] = useState(0);

  const el_id = useMemo(() => `root_info_view_${++__id}`, [])

  useEffect(() => {
    if (!mod?.info) return;
    const el = document.getElementById(el_id)
    const head = el?.firstElementChild;
    if (!el || !head) {
      console.log(el_id, el, head)
      set_margin_top(0)
      return;
    }
    const resize = () => {
      set_margin_top(head.getBoundingClientRect().height)
    }
    const r = new ResizeObserver(resize);
    r.observe(head)
    resize()
    return () => { r.disconnect() }
  }, [el_id, mod])

  const [listLike, set_listLike] = useState<ListLike | undefined>(void 0)
  useEffect(() => {
    if (is_root) {
      set_listLike('list')
      return;
    }
    set_listLike(curr_list_like(info?.children_look))
  }, [info, is_root])


  return <>
    <InfoView
      id={is_root ? el_id : void 0}
      backable={is_root}
      foldable={!is_root}
      onClickBack={async () => {
        if (canGoBack) nav(-1)
        else nav(Paths.All.Main)
      }}
      info={is_root ? mod?.info : info}
      record={is_root ? mod?.record : record}
      className={is_root ? csses.main : csses.main_right}
      listLike={listLike}
      whenListLike={set_listLike}
      open={open}
      actions={is_root ? <LangButton /> : void 0}
      style={{
        paddingTop: margin_top
      }} />
    <Loading fixed center loading={loading} big />
  </>
}