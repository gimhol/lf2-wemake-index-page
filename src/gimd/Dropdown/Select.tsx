import { IconButton } from "@/components/button/IconButton";
import { interrupt_event } from "@/utils/interrupt_event";
import { usePropState } from "@/utils/usePropState";
import cns from "classnames";
import { useMemo, type ReactNode } from "react";
import { Dropdown, type DropdownProps, type IOption } from "./Dropdown";
import csses from "./style.module.scss";

export interface DropdownSelectProps<Value> extends
  Omit<DropdownProps, 'onChange' | 'onPointerDown'>,
  Omit<React.HTMLAttributes<HTMLDivElement>, 'open' | 'onChange' | 'value' | 'defaultValue'> {
  options?: IOption<Value>[],
  value?: Value;
  onChange?(v?: Value): void,
  defaultValue?: Value;
  placeholder?: ReactNode;
}
export function Select<Value>(props: DropdownSelectProps<Value>) {
  const {
    menu, options,
    onChange: __onChange,
    value: __value, placeholder,
    style, defaultValue, className, onPointerDown, ..._p
  } = props;

  const [value, set_value] = usePropState(__value ?? defaultValue, __onChange)
  const [real_menu] = useMemo(() => {
    const ret = { ...menu }
    if (!options?.length) return [ret];
    ret.items = options.map(v => {
      return {
        children: v.label ?? v.children ?? ('' + v.value),
        onClick: (e) => {
          v.onClick?.(e)
          __onChange?.(v.value)
          set_value(v.value)
        }
      }
    })
    return [ret]
  }, [menu, options, __onChange, set_value])

  const [selected_options] = useMemo(() => {
    if (!options) return [[{ value: value, label: '' + value }]] as const;
    return [[options.find(o => o.value === value)].filter(Boolean)] as const
  }, [options, value]);

  const label = selected_options.map(v => v?.label ?? ('' + v?.value)).join()

  return (
    <Dropdown {..._p} menu={real_menu}>
      <div
        className={cns(csses.select, className)}
        style={style}
        onPointerDown={onPointerDown}>
        {label || placeholder}
        {
          selected_options.length ?
            <IconButton
              icon='✖︎'
              style={{ marginLeft: 10, padding: 0, borderRadius: `50%`, width: 16, height: 16, fontSize: 16 }}
              onPointerDown={(e) => {
                interrupt_event(e);
                set_value(void 0)
              }} /> :
            void 0
        }
      </div>
    </Dropdown>
  )
}