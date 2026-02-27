/* eslint-disable @typescript-eslint/no-explicit-any */
import img_gimink from "@/assets/svg/gimink.svg";
import img_github from "@/assets/svg/github.svg";
import img_login from "@/assets/svg/login.svg";
import img_logout from "@/assets/svg/logout.svg";
import img_menu from "@/assets/svg/menu.svg";
import { IconButton } from "@/components/button/IconButton";
import { LangButton } from "@/components/LangButton";
import { Loading } from "@/components/loading";
import { Mask } from "@/components/mask";
import { Dropdown } from "@/gimd/Dropdown";
import Show from "@/gimd/Show";
import Toast from "@/gimd/Toast";
import GlobalStore from "@/GlobalStore";
import { useMovingBg } from "@/hooks/useMovingBg";
import { ApiHttp } from "@/network/ApiHttp";
import * as KnownError from "@/network/KnownError";
import { Paths } from "@/Paths";
import { useSmallScreen } from "@/useSmallScreen";
import { submit_visit_event } from "@/utils/events";
import { interrupt_event } from "@/utils/interrupt_event";
import { LocationParams } from "@/utils/LocationParams";
import cns from "classnames";
import { useCallback, useContext, useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { Outlet, useLocation, useNavigate } from "react-router";
import { fetch_infos, type IRecordInfo } from "./fetch_info_list";
import { MainContext } from "./main_context";
import { NavButton } from "./NavButton";
import csses from "./styles.module.scss";

const a_mappings: { [x in string]?: string } = {
  'origin': `1`,
  'wmods': `2`,
  'mods': `3`,
  'tools': `4`,
}
const b_mappings: { [x in string]?: string } = {};
for (const k in a_mappings) b_mappings[a_mappings[k]!] = k

export default function MainPage() {
  useEffect(() => { submit_visit_event(); })
  useMovingBg(document.documentElement)
  const { t, i18n } = useTranslation()
  const [games, set_games] = useState<IRecordInfo[]>()
  const [loading, set_loading] = useState(false);
  const nav = useNavigate();
  const { value: { session_id, nickname, username, admin }, dispatch } = useContext(GlobalStore.context);
  const {
    search, hash,
    params: { raw: { game_id } }
  } = LocationParams.useAll()
  const real_game_id = useMemo(() => a_mappings['' + game_id] ?? game_id, [game_id]);
  const { pathname } = useLocation()
  const set_location = useCallback((opts: { game?: string }) => {
    const { game } = opts
    const pathname = typeof game === 'string' ?
      Paths.All.InnerInfo.replace(':game_id', game) :
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
    if (pathname !== Paths.All.Main && Paths.has_permission(pathname)) return;
    const curr = games?.find(v => v.id == real_game_id);
    if (curr) return;
    const next_game_id = games?.find(v => v)?.id?.toString();
    const game = b_mappings['' + next_game_id] ?? next_game_id
    set_location({ game: game })
  }, [search, real_game_id, set_location, games, pathname])

  useEffect(() => {
    const session = search.get_string('session')
    if (!session) return;
    dispatch({ type: 'merge', value: { session_id: session } })
    set_location({})
  }, [set_location, search, dispatch])

  useEffect(() => {
    if (!session_id) return;
    const c = new AbortController()
    ApiHttp.post<any, any>(`user/info`, void 0, void 0, {
      headers: { authorization: session_id },
      signal: c.signal
    }).then(r => {
      if (c.signal.aborted) return;
      dispatch({
        type: 'merge', value: {
          session_id: session_id,
          admin: r.data.admin,
          user_id: r.data.id,
          username: r.data.username,
          nickname: r.data.nickname,
        }
      })
      set_location({})
    })
      .catch(ApiHttp.ignoreAbort)
      .catch(e => {
        KnownError.is(e)
      }).catch((e) => {
        Toast.show(e)
      })
    return () => c.abort()
  }, [session_id, dispatch, set_location])

  const actived: IRecordInfo | undefined = useMemo(() => games?.find(v => v.info.id == real_game_id), [real_game_id, games])

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    set_loading(true)
    const ab = new AbortController();
    const lang = i18n.language.toLowerCase().startsWith('zh') ? 'zh' : 'en';
    fetch_infos(lang, { signal: ab.signal })
      .then((list) => {
        if (ab.signal.aborted) return;
        set_games(list)
      }).catch(e => {
        if (ab.signal.aborted) return;
        Toast.error(e)
      }).finally(() => {
        if (ab.signal.aborted) return;
        set_loading(false)
      })
    return () => ab.abort()
  }, [i18n])
  const small = useSmallScreen()
  const [game_list_open, set_game_list_open] = useState(!small);
  const game_list = useMemo(() => {
    return (
      <div className={cns(csses.game_list, game_list_open ? void 0 : csses.close, csses.scrollview)}>
        <NavButton
          show={!!session_id}
          actived={pathname === Paths.All.Workspace}
          children={t('workspace')}
          onClick={(e) => {
            if (small) set_game_list_open(false)
            interrupt_event(e);
            set_location({ game: 'yours' });
          }}
        />
        <NavButton
          show={!!session_id && admin == 255}
          actived={pathname === Paths.All.Dashboard}
          children={t('dashboard')}
          onClick={(e) => {
            if (small) set_game_list_open(false)
            interrupt_event(e);
            set_location({ game: 'dashboard' });
          }}
        />
        {games?.map((v) => <NavButton
          key={v.id}
          actived={real_game_id === v.info.id}
          children={v.info.short_title}
          onClick={e => {
            interrupt_event(e);
            set_location({ game: b_mappings['' + v.info.id] ?? v.info.id });
            if (small) set_game_list_open(false)
          }} />
        )}
        <NavButton
          children={t('Dat Editor')}
          onClick={(e) => {
            if (small) set_game_list_open(false)
            interrupt_event(e);
            set_location({ game: 'editor' });
          }}
        />
        <Loading loading={loading} center absolute />
      </div>
    )
  }, [game_list_open, session_id, pathname, t, admin, games, loading, set_location, small, real_game_id])
  return <>
    <MainContext.Provider value={{ info: actived?.info, record: actived }}>
      <div className={csses.main_page}
        onDragOver={e => { e.stopPropagation(); e.preventDefault() }}
        onDrop={e => { e.stopPropagation(); e.preventDefault() }} >
        <div className={csses.head}>
          <IconButton
            icon={img_menu}
            onClick={() => set_game_list_open(!game_list_open)} />
          <h1 className={csses.main_title}>
            {t("main_title")}
          </h1>
          <div className={csses.right_zone}>
            <Show yes={!!session_id}>
              <div className={csses.hello}>
                Hi, {nickname || username || 'Somebody'}
              </div>
            </Show>
            <LangButton />
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
                    onClick: () => document.location = `${API_BASE}user/gitee/oauth?route_mode=hash&redirect=${encodeURIComponent(window.location.toString())}`
                  }]
                }}>
                <IconButton
                  title={t('login')}
                  icon={img_login} />
              </Dropdown>
            </Show>
            <Show yes={!!session_id}>
              <IconButton
                title={t('logout')}
                icon={img_logout}
                onClick={() => {
                  dispatch({ type: 'reset' })
                }} />
            </Show>
            <IconButton
              href="https://github.com/gimhol/little-fighter-2-WEMAKE"
              title={t('goto_github')}
              icon={img_github} />
            <IconButton
              href="https://gim.ink"
              title={t('goto_gimink')}
              icon={img_gimink} />
          </div>
        </div>
        <div className={csses.main}>
          <Show yes={!small}>
            {game_list}
          </Show>
          <Outlet />
        </div>
        <div className={csses.foot}>
          <span className={csses.foot}>
            {t('latest_build_time')}: {BUILD_TIME}
          </span>
        </div>
      </div >
      <Loading big loading={loading} style={{ position: 'absolute', margin: 'auto auto' }} />
      <Show yes={small}>
        <Mask
          className={csses.game_list_mask}
          container={() => document.body}
          closeOnMask
          open={game_list_open && small}
          whenChange={() => set_game_list_open(false)}>
          {game_list}
        </Mask>
      </Show>
    </MainContext.Provider>
  </>
}
