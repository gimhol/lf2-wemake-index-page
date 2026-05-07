
import img_arrow from "@/assets/svg/angle-right.svg";
import Close from "@/art/ic_small_close.svg?react";
import { type IIconButtonProps, IconButton } from "@/components/button/IconButton";

export function BackButton(props: IIconButtonProps) {
  const { ..._p } = props;
  return (
    <IconButton
      styles={{ icon: { transform: `rotateZ(180deg)` } }}
      icon={img_arrow}
      {..._p} />
  );
}

export function CloseButton(props: IIconButtonProps) {
  const { ..._p } = props;
  return (
    <IconButton
      icon={<Close style={{ width: 16 }} />}
      {..._p} />
  );
}
