import classNames from "classnames";
import { useEffect, useMemo } from "react";
import img_small_loading_frames from "../../assets/img_small_loading_frames.png";
import img_small_loading_frames_x4 from "../../assets/img_small_loading_frames_x4.png";
import { LoadingImg } from "./LoadingImg";
import csses from "./index.module.scss";

export interface ILoadingProps extends Omit<React.ImgHTMLAttributes<HTMLImageElement>, 'loading'> {
  loading?: boolean;
  big?: boolean;
  tiny?: boolean;
  fixed?: boolean;
  absolute?: boolean;
  center?: boolean;
  top?: boolean;
  bottom?: boolean;
  left?: boolean;
  right?: boolean;
}
export function Loading(props: ILoadingProps) {
  const {
    loading, big = false, center, fixed, absolute, className,
    top, bottom, left, right, tiny = false, ..._p
  } = props;

  const [logic, src] = useMemo(() => {
    return [
      new LoadingImg(33 * (big ? 4 : 1), 21 * (big ? 4 : 1)),
      big ? img_small_loading_frames_x4 : img_small_loading_frames
    ] as const
  }, [big])

  useEffect(() => {
    if (loading)
      logic.show()
    else
      logic.hide();
  }, [loading, logic]);

  const cls = useMemo(() => {
    return classNames(className,
      big ? csses.loading_img_l : csses.loading_img_s,
      tiny ? csses.tiny : void 0,
      {
        [csses.fixed]: fixed,
        [csses.absolute]: absolute,
        [csses.center]: center,
        [csses.top]: top,
        [csses.bottom]: bottom,
        [csses.left]: left,
        [csses.right]: right
      })
  }, [big, fixed, absolute, className, center, top, bottom, left, right, tiny])
  return (
    <img
      src={src}
      alt="loading..."
      className={cls}
      ref={r => logic.set_element(r)}
      {..._p} />
  )
}