import { Dropdown as _Dropdown, type DropdownProps as _DropdownProps } from "./Dropdown";
import { Select as _Select } from "./Select";
export type DropdownProps = _DropdownProps;
export const Dropdown = Object.assign(_Dropdown, {
  Select: _Select
})
export default Dropdown;