import img_browser from "@/assets/svg/browser.svg"
import img_download from "@/assets/svg/download.svg"
import type { ReactNode } from "react"

export enum InfoUrlType {
  Download = 'download',
  OpenInBrowser = 'open_in_browser',
  GameInBrowser = 'game_in_browser',
}
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const all_info_url_type: InfoUrlType[] = Object.keys(InfoUrlType).map(k => (InfoUrlType as any)[k])

export const icons: Record<InfoUrlType, ReactNode> = {
  [InfoUrlType.Download]: img_download,
  [InfoUrlType.OpenInBrowser]: img_browser,
  [InfoUrlType.GameInBrowser]: img_browser,
}