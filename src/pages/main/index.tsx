/* eslint-disable @typescript-eslint/no-explicit-any */
import img_gimink from "@/assets/svg/gimink.svg";
import img_github from "@/assets/svg/github.svg";
import img_login from "@/assets/svg/login.svg";
import img_logout from "@/assets/svg/logout.svg";
import img_menu from "@/assets/svg/menu.svg";
import img_upload from "@/assets/svg/upload.svg";
import { Info } from "@/base/Info";
import { IconButton } from "@/components/button/IconButton";
import { Loading } from "@/components/loading/LoadingImg";
import { Mask } from "@/components/mask";
import { Dropdown } from "@/gimd/Dropdown";
import Show from "@/gimd/Show";
import Toast from "@/gimd/Toast";
import { useGlobalValue } from "@/GlobalStore/useGlobalValue";
import { useMovingBg } from "@/hooks/useMovingBg";
import { ApiHttp } from "@/network/ApiHttp";
import * as KnownError from "@/network/KnownError";
import { Paths } from "@/Paths";
import { submit_visit_event } from "@/utils/events";
import { LocationParams } from "@/utils/LocationParams";
import classnames from "classnames";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { useLocation, useNavigate, useParams } from "react-router";
import { LangButton } from "../../components/LangButton";
import { InfoView } from "../info";
import { YoursPage } from "../yours";
import { fetch_info_list } from "./fetch_info_list";
import { ModFormView } from "./ModFormView";
import csses from "./styles.module.scss";

const time_str = Math.floor(Date.now() / 60000);
export default function MainPage() {
  const [toast, toast_ctx] = Toast.useToast()
  useEffect(() => { submit_visit_event(); })
  useMovingBg(document.documentElement)
  const { t, i18n } = useTranslation()
  const [games, set_games] = useState<Info[]>()
  const [loading, set_loading] = useState(false);
  const [ss_open, set_ss_open] = useState(false)
  const nav = useNavigate();
  const location = useLocation();
  const { game_id } = useParams();
  const { global_value, set_global_value } = useGlobalValue();
  const { session_id } = global_value
  const { search, hash } = useMemo(() => ({
    search: LocationParams.parse(location.search.substring(1)),
    hash: LocationParams.parse(location.hash.substring(1))
  }), [location])

  const set_location = useCallback((opts: { game?: string }) => {
    const { game } = opts
    const pathname = typeof game === 'string' ?
      Paths.All.main_page_with.replace(':game_id', game) :
      void 0;
    const next_search = search.clone();
    next_search.delele('session');
    nav({
      pathname,
      search: next_search.to_query(),
      hash: hash.to_query()
    })
  }, [nav, search, hash])

  useEffect(() => {
    const session = search.get_string('session')
    if (session) return;
    if (!game_id || (!session_id && game_id === 'yours')) {
      set_location({ game: games?.find(v => v)?.id })
    }
  }, [session_id, search, game_id, set_location, games])

  useEffect(() => {
    const session = search.get_string('session')
    if (!session) return;
    set_global_value(prev => ({ ...prev, session_id: session }))
    set_location({})

  }, [set_location, search, set_global_value, toast])

  useEffect(() => {
    const c = new AbortController()
    ApiHttp.post<any, any>(`user/info`, void 0, void 0, {
      headers: { authorization: session_id },
      signal: c.signal
    }).then(r => {
      if (c.signal.aborted) return;
      set_global_value(prev => ({
        ...prev,
        session_id: session_id,
        admin: r.data.admin,
        user_id: r.data.id,
        username: r.data.username,
        nickname: r.data.nickname,
      }))
      set_location({})
    })
      .catch(ApiHttp.ignoreAbort)
      .catch(e => {
        KnownError.is(e)
      }).catch((e) => {
        toast(e)
      })
    return () => c.abort()
  }, [session_id])


  const actived = useMemo(() => games?.find(v => v.id === game_id), [game_id, games])

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    set_loading(true)
    const ab = new AbortController();
    const lang = i18n.language.toLowerCase().startsWith('zh') ? 'zh' : 'en';
    fetch_info_list(`games.json?time=${time_str}`, null, lang, { signal: ab.signal })
      .then((list) => {
        if (ab.signal.aborted) return;
        set_games(list)
      }).catch(e => {
        if (ab.signal.aborted) return;
        console.warn(e)
        toast({ id: '' + e, msg: '' + e })
      }).finally(() => {
        if (ab.signal.aborted) return;
        set_loading(false)
      })
    return () => ab.abort()
  }, [i18n, toast])

  const [game_list_open, set_game_list_open] = useState(false);

  const game_list = useMemo(() => {
    return (
      <Show yes={!!games?.length || session_id}>
        <div className={classnames(csses.game_list, csses.scrollview)}>
          {games?.map((v, idx) => {
            const cls_name = (game_id ? game_id === v.id : idx == 0) ? csses.game_item_actived : csses.game_item
            return (
              <button className={cls_name} key={v.id} onClick={() => {
                set_location({ game: v.id });
                set_game_list_open(false)
              }}>
                {v.short_title}
              </button>
            )
          })}
          <Show yes={!!session_id}>
            <button className={csses.game_item} onClick={() => {
              set_location({ game: 'yours' });
              set_game_list_open(false)
            }}>
              {t('your_works')}
            </button>
          </Show>
        </div>
      </Show>
    )
  }, [games, game_id, session_id, t, set_location])

  return <>
    <div className={csses.main_page}>
      {toast_ctx}
      <div className={csses.head}>
        <IconButton
          className={csses.btn_toggle_game_list}
          onClick={() => set_game_list_open(!game_list_open)}
          img={img_menu}
          title={t('menu')} />
        <h1 className={csses.main_title}>
          {t("main_title")}
        </h1>
        <div className={csses.right_zone}>
          <LangButton whenClick={next => games?.map(v => v.with_lang(next))} />
          <Show yes={!session_id}>
            <Dropdown
              alignX={1}
              anchorX={1}
              menu={{
                // 没搞懂为什么此处 window.location.toString() 没有立刻变化，故在onClik才获取地址 -Gim
                items: [{
                  children: t('github_login'),
                  title: t('gitee_login'), 
                  onClick: () => document.location = `${API_BASE}user/github/oauth?route_mode=hash&redirect=${encodeURIComponent(window.location.toString())}`
                },
                {
                  children: t('gitee_login'),
                  title: t('gitee_login'),
                  onClick: () => document.location = `${API_BASE}user/github/oauth?route_mode=hash&redirect=${encodeURIComponent(window.location.toString())}`
                }]
              }}>
              <IconButton
                title={t('login')}
                img={img_login} />
            </Dropdown>
          </Show>
          <Show yes={!!session_id}>
            <IconButton
              title={t('logout')}
              img={img_logout}
              onClick={() => set_global_value(prev => ({ ...prev, session_id: '' }))} />
          </Show>
          <Show yes={!!session_id}>
            <IconButton
              onClick={() => set_ss_open(true)}
              title={t('submit_your_mod')}
              img={img_upload} />
          </Show>
          <IconButton
            href="https://github.com/gimhol/little-fighter-2-WEMAKE"
            title={t('goto_github')}
            img={img_github} />
          <IconButton
            href="https://gim.ink"
            title={t('goto_gimink')}
            img={img_gimink} />
        </div>
      </div>
      <div className={csses.main}>
        {game_list}
        {game_id === 'yours' ?
          <YoursPage /> :
          <InfoView
            info={actived}
            className={csses.main_right}
            open={window.innerWidth > 480} />}

      </div>
      {/* 
      <div className={csses.foot}>
        <a className={styles.link}
          href="https://beian.miit.gov.cn/"
          target="_blank"
          rel="noreferrer">
          粤ICP备2021170807号-1
        </a> 
      </div>
      */}
    </div >
    <Loading big loading={loading} style={{ position: 'absolute', margin: 'auto auto' }} />
    <Mask
      className={csses.game_list_mask}
      container={() => document.body}
      closeOnMask
      open={game_list_open}
      onClose={() => set_game_list_open(false)}>
      {game_list}
    </Mask>
    <Mask container={() => document.body} open={ss_open} onClose={() => set_ss_open(false)}>
      <ModFormView />
      <IconButton
        style={{ position: 'absolute', right: 10, top: 10 }}
        letter='✖︎'
        onClick={() => set_ss_open(false)} />
    </Mask>
  </>
}

