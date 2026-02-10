import { IconButton } from "@/components/button/IconButton"
import { context } from "@/GlobalStore/context"
import { useOSS } from "@/hooks/useOSS"
import { useContext } from "react"

export function YoursPage() {
  const { global_value: { user_id, username, nickname } } = useContext(context)
  const [oss, { dir }] = useOSS()
  return <>
    <IconButton onClick={() => {
      if (!oss) return;
      const now = Date.now()
      const name = `${now}.info.json`
      oss.put(`${dir}/${now}/${name}`, new Blob(["HELLO"], { type: 'application/json; charset=utf-8' }), {
        mime: "application/json",
        headers: {
          "Content-Type": 'application/json',
          "Content-Disposition": `attachment;filename="${encodeURIComponent(name)}"`,
          "x-oss-meta-user-id": '' + user_id,
          "x-oss-meta-username": '' + username,
          "x-oss-meta-nickname": '' + nickname,
        }
      }).then(() => {
        
        alert('!')
      }).catch(e => {
        alert('!')
        console.error(e)
      })
    }}>
      ADD
    </IconButton>
    {/* oss: {!!oss}
    YOURS DIR {dir} */}
  </>
}