/* eslint-disable @typescript-eslint/no-unused-vars */
import type { IMenuBarItem } from ".";
import Button from "../Button";

export function built_in_item_render(item: IMenuBarItem, idx: number, _items: IMenuBarItem[]) {
  const { label, ...btn_props } = item;
  return <Button size='s' key={idx} {...btn_props}>{label}</Button>;
}
