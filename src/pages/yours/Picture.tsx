import { Loading } from "@/components/loading";
import cns from "classnames";
import { useState } from "react";
import csses from "./Picture.module.scss";

export interface IPictureProps extends
  React.HTMLAttributes<HTMLDivElement>,
  Pick<React.ImgHTMLAttributes<HTMLImageElement>, 'src' | 'width' | 'height' | 'alt'> {
  _?: undefined;
  classNames?: {
    root?: string;
    loading?: string;
    img?: string;
    fallback?: string;
  }
}

export function Picture(props: IPictureProps) {
  const { src, width, height, alt, onLoad, onError, className, classNames, ..._p } = props;
  const [status, set_status] = useState(0)
  return (
    <div {..._p} className={cns(csses.pic_root, className, classNames?.root)}>
      {status === 0 ? <Loading loading className={cns(csses.loading, classNames?.loading)} /> : null}
      {status === 2 ? <div className={cns(csses.fallback, classNames?.fallback)}>🖼️</div> : null}
      <img
        src={src}
        width={width}
        height={height}
        alt={alt}
        className={cns(csses.img, classNames?.img)}
        style={{ opacity: status === 1 ? void 0 : 0 }}
        onLoad={e => { onLoad?.(e); set_status(1) }}
        onError={e => { onError?.(e); set_status(2) }}
      />
    </div>
  );
}
