import { Mask, type IMaskProps } from "@/components/mask";
import type { CSSProperties, VideoHTMLAttributes } from "react";

export interface IVideoModalProps extends IMaskProps, Pick<VideoHTMLAttributes<HTMLVideoElement>, 'src' | 'width'> {

}
const base_style: CSSProperties = { display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100%', height: '100%' }
const video_style: CSSProperties = { borderRadius: 10, overflow: "hidden", background: 'black' }
export function VideoModal(props: IVideoModalProps) {
  const { src, container = document.body, width = 600, closeOnMask = true, ..._p } = props;
  return (
    <Mask
      container={container}
      closeOnMask={closeOnMask}
      {..._p}
      style={base_style}>
      <video
        src={src}
        width={width}
        controls style={video_style} />
    </Mask>
  );
}
