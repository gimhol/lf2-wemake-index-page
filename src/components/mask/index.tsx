import { type _IMaskProps, _Mask } from "./_Mask";
import { _Provider, mask_context } from "./_Provider";
export type IMaskProps = _IMaskProps;
export const Mask = Object.assign(_Mask, {
  Provider: _Provider,
  context: mask_context,
});
export default Mask