export interface ToastInfo {
  id?: number | string;
  msg: string;
  duration?: number;
  count?: number;
  badge?: boolean;
  badge_color?: string;
  type?: string;
}
