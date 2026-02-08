import { type IIconButtonProps, IconButton } from "@/components/button/IconButton";
import { usePropState } from "../../utils/usePropState";
import img_arr from "@/assets/svg/angle-right.svg"
export interface ICollapseButtonProps extends IIconButtonProps {
  open?: boolean;
  whenChange?(v: boolean): void;
}
export function CollapseButton(props: ICollapseButtonProps) {
  const { open, whenChange, onClick, ..._p } = props;
  const [__open, __set_open] = usePropState(open, whenChange)
  return (
    <IconButton
      onClick={(e) => {
        onClick?.(e);
        __set_open(!__open);
      }}
      title="fold or unfold"
      style={{ transform: `rotateZ(${__open ? 90 : 0}deg)` }}
      img={img_arr}
      {..._p} />
  );
}
