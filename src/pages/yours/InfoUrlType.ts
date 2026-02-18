export enum InfoUrlType {
  Download = 'download',
  OpenInBrowser = 'open_in_browser',
  PlayInBrowser = 'play_in_browser',
  GameInBrowser = 'game_in_browser',
}
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const all_info_url_type: InfoUrlType[] = Object.keys(InfoUrlType).map(k => (InfoUrlType as any)[k])