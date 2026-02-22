
import img_arrow from "@/assets/svg/angle-right.svg";
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


