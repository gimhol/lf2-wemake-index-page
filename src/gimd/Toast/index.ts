import { _Provider } from "./_Provider";
import { Toast } from "./_Toast";
import { _useToast } from "./_useToast";

Toast.Provider = _Provider
Toast.useToast = _useToast;

export { _Provider as Provider } from "./_Provider";
export { Toast, type IToastProps } from "./_Toast";
export { type ToastInfo } from "./_ToastInfo";
export default Toast;