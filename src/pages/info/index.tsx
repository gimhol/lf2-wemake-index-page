/* eslint-disable react-hooks/set-state-in-effect */
import { Paths } from "@/Paths"
import { LangButton } from "@/components/LangButton"
import { Loading } from "@/components/loading"
import Toast from "@/gimd/Toast"
import { useCanGoBack } from "@/hooks/useCanGoBack"
import { useContext, useEffect, useMemo, useRef, useState } from "react"
import { useTranslation } from "react-i18next"
import { useLocation, useNavigate, useParams } from "react-router"
import { useImmer } from "use-immer"
import { MainContext } from "../main/main_context"
import { get_mod, type IMod } from "../yours/get_mod"
import { curr_list_like, InfoView, type ListLike } from "./InfoView"
import csses from "./style.module.scss"
import { ewents } from "@/utils/ewents"
import dayjs from "dayjs"
import img_github from "@/assets/svg/github.svg";
let __id = 0;
export default function InfoViewPage() {
  const { t, i18n } = useTranslation()
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
  const [margin_bottom, set_margin_bottom] = useState(0);
  const el_id = useMemo(() => `root_info_view_${++__id}`, [])
  const ref_foot = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!mod?.info) return;
    const el = document.getElementById(el_id)
    const head = el?.firstElementChild;
    const foot = ref_foot.current;
    if (!el || !head || !foot) {
      set_margin_top(0)
      set_margin_bottom(0)
      return;
    }
    const resize = () => {
      set_margin_top(head.getBoundingClientRect().height)
      set_margin_bottom(foot.getBoundingClientRect().height)
    }
    const r = new ResizeObserver(resize);
    r.observe(head)
    r.observe(foot)
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

  const build_time = dayjs(BUILD_TIME)
  const build_time_text = build_time.isSame(dayjs(), 'day') ?
    build_time.format('YYYY-MM-DD HH:mm:ss') :
    build_time.format('HH:mm:ss')


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
      style={is_root ? {
        marginTop: margin_top,
        height: `calc(100% - ${margin_top}px - ${margin_bottom}px)`
      } : void 0} >
      <Loading fixed center loading={loading} big />
      {
        is_root ?
          <div className={csses.foot} ref={ref_foot}>
            <a
              {...ewents.click('goto_discussions')}
              target='_blank'
              className={csses.discussions}
              href="https://github.com/gimhol/little-fighter-2-WEMAKE/discussions">
              <img src={img_github} /> {t('suggest_ask_feedback')}
            </a>
            <div style={{ flex: 1 }}></div>
            <div className={csses.right_zone}>
              <span>
                {t('unstable_wip_buggy')}
              </span>
              <span>
                {t('latest_build_time')}: {build_time_text}
              </span>
            </div>
          </div> : void 0
      }
    </InfoView>

  </>
}
