import { useEffect, useRef, useState, useMemo } from "react";

export type TChild = string | null | undefined
export interface INotText extends React.CanvasHTMLAttributes<HTMLCanvasElement> {
  children?: TChild | TChild[];
  font_size?: number;
  line_height?: number;
  fill_style?: string | CanvasGradient | CanvasPattern;
}
export function NotText(props: INotText) {
  const {
    children, font_size = 14, line_height, style, className, fill_style
  } = props;

  const _canvas_ref = useRef<HTMLCanvasElement>(null);
  const [_base_style, _set_base_style] = useState<React.CSSProperties>({ width: 0, height: 0 });
  const font = useMemo(() => {
    return `normal bold ${font_size}px bold Arial`
  }, [font_size])

  useEffect(() => {
    const canvas = _canvas_ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const padding = { top: 0, bottom: 0, left: 0, right: 0 };

    ctx.font = font;
    const full_str = typeof children === 'string' ? children : children?.filter(v => v).join('') ?? '';

    const lines = full_str.split('\n');
    let height_sum = 0;
    let max_line_width = 0;

    const infos = lines.map(str => {
      const tm = ctx.measureText(str);
      const h = line_height ? line_height : 2 + (tm.actualBoundingBoxAscent + tm.actualBoundingBoxDescent);
      const w = tm.width;
      height_sum += h;
      max_line_width = Math.ceil(Math.max(max_line_width, w));
      return {
        x: 0,
        y: height_sum - tm.actualBoundingBoxDescent,
        w,
        h: line_height,
        str
      };
    });
    const height = padding.top + padding.bottom + height_sum;
    const width = padding.left + padding.right + max_line_width;

    const scale = window.devicePixelRatio;
    canvas.width = Math.floor(width * scale);
    canvas.height = Math.floor(height * scale);
    _set_base_style({
      width,
      height,
      display: 'inline',
      verticalAlign: 'top'
    });

    ctx.clearRect(0, 0, width, height);
    const lg = ctx.createLinearGradient(0, 0, width, height)
    const rs = ['red', 'green', 'blue', 'brown']
    for (let i = 0; i <= 10; ++i) {
      lg.addColorStop(i / 10, rs[i % rs.length])
    }
    ctx.fillStyle = fill_style ?? lg;
    ctx.font = font;
    ctx.scale(scale, scale);
    infos.forEach(info => {
      ctx.fillText(info.str,
        padding.left + info.x,
        padding.top + info.y
      );
    });
  }, [children, font, line_height, fill_style]);

  const _style = useMemo(() => ({ ..._base_style, ...style }), [_base_style, style])
  return (<canvas ref={_canvas_ref} style={_style} className={className} />);
}
