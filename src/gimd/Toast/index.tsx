import { _Provider } from "./Provider";
import { Toast } from "./Toast";
import { _useToast } from "./useToast";

Toast.Provider = _Provider
Toast.useToast = _useToast;

export { _Provider as Provider } from "./Provider";
export { Toast, type IToastProps } from "./Toast";
export { type ToastInfo } from "./ToastInfo";
export default Toast;