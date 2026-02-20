/* eslint-disable react-hooks/set-state-in-effect */
import { Paths } from "@/Paths"
import { Loading } from "@/components/loading"
import Toast from "@/gimd/Toast"
import { useContext, useEffect, useState } from "react"
import { useLocation, useParams } from "react-router"
import { useImmer } from "use-immer"
import { main_context } from "../main/main_context"
import { get_mod, type IMod } from "../yours/get_mod"
import { InfoView } from "./InfoView"
import csses from "./index.module.scss"

export default function InfoViewPage() {
  const { info } = useContext(main_context)
  const { game_id: mod_id } = useParams()
  const location = useLocation()

  const is_root = Paths.All.Info.replace(':game_id', '' + mod_id) === location.pathname
  const open = is_root || !(info?.subs?.length)

  const [loading, set_loading] = useState(false)
  const [mod, set_mod] = useImmer<IMod | undefined>(void 0)
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

  return <>
    <InfoView
      info={is_root ? mod?.info : info}
      className={is_root ? csses.main : csses.main_right}
      open={open} />
    <Loading fixed center loading={loading} big />
  </>
}