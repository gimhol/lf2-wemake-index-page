export interface IToastInfo {
  id?: number | string;
  msg: string;
  duration?: number;
  count?: number;
  badge?: boolean;
  badge_color?: string;
  type?: string;
}
export interface IUseToastOpts {
  container?: null | HTMLElement;
}
export interface IToastFunc {
  (msg: string | IToastInfo): void
}
export interface IToast extends IToastFunc {
  success: IToastFunc
  error: IToastFunc
}
export const empty_toast_instance: IToast = Object.assign(() => { }, {
  success: () => { },
  error: () => { }
})
export type IUseToastRet = readonly [IToast, React.ReactNode]