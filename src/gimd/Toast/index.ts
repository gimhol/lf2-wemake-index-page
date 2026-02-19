import { _Provider } from "./_Provider";
import { Toast } from "./_Toast";
export * from "./_Common";
export { _Provider as Provider } from "./_Provider";
export { Toast, type IToastProps } from "./_Toast";
Toast.Provider = _Provider
export default Toast;