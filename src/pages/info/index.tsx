/* eslint-disable react-hooks/set-state-in-effect */
import { Paths } from "@/Paths"
import { Loading } from "@/components/loading"
import Toast from "@/gimd/Toast"
import { useCanGoBack } from "@/hooks/useCanGoBack"
import { useContext, useEffect, useState } from "react"
import { useLocation, useNavigate, useParams } from "react-router"
import { useImmer } from "use-immer"
import { MainContext } from "../main/main_context"
import { get_mod, type IMod } from "../yours/get_mod"
import { InfoView } from "./InfoView"
import csses from "./index.module.scss"

export default function InfoViewPage() {
  const { info, record } = useContext(MainContext)
  const { game_id: mod_id } = useParams()
  const location = useLocation()

  const is_root = Paths.All.Info.replace(':game_id', '' + mod_id) === location.pathname
  const open = is_root || !(info?.subs?.length)

  const [loading, set_loading] = useState(false)
  const [mod, set_mod] = useImmer<IMod | undefined>(void 0)
  const canGoBack = useCanGoBack()

  useEffect(() => {
    if (!mod_id || !is_root) {
      set_mod(void 0);
      set_loading(false);
      return
    }
    const ab = new AbortController();
    set_loading(true)
    get_mod({ mod_id: Number(mod_id) }).then(r => {
      if (ab.signal.aborted) return;
      set_mod(r)
    }).catch(e => {
      if (ab.signal.aborted) return;
      Toast.error(e)
    }).finally(() => {
      set_loading(false)
    })
    return () => ab.abort()
  }, [mod_id, set_mod, is_root])
  const nav = useNavigate();

  return <>
    <InfoView
      backable={is_root}
      foldable={!is_root}
      onClickBack={async () => {
        if (canGoBack) nav(-1)
        else nav(Paths.All.Main)
      }}
      info={is_root ? mod?.info : info}
      record={is_root ? mod?.record : record}
      className={is_root ? csses.main : csses.main_right}
      open={open} />
    <Loading fixed center loading={loading} big />
  </>
}