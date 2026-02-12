import { useContext } from "react"
import { main_context } from "../main/main_context"
import { InfoView } from "./InfoView"
import csses from "./index.module.scss"

export default function InfoViewPage() {
  const { info } = useContext(main_context)
  
  return (
    <InfoView
      info={info}
      className={csses.main_right}
      open={window.innerWidth > 480} />
  )
}