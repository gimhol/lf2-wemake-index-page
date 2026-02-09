
import React, { useRef, useEffect, useMemo } from "react";

const default_storke_styles: ISVGProps['styles'] = {
  paths: {
    stroke: 'currentColor'
  }
};
export interface ISVGProps extends ISvgProps {
  c: React.FC<ISvgProps>
  styles?: {
    paths?: Partial<CSSStyleDeclaration>;
  }
}
export function SVG(props: ISVGProps) {
  const { c: C, styles = default_storke_styles,
    width = 12, height = 12, style, ...p } = props;
  const ref = useRef<SVGSVGElement | null>(null);

  useEffect(() => {
    const paths = ref.current?.querySelectorAll('path');
    if (styles?.paths) paths?.forEach(path => Object.assign(path.style, styles.paths));
  }, [styles?.paths]);

  const _style = useMemo(() => {
    const ret = { ...style }
    if (width !== void 0) ret.width = width;
    if (height !== void 0) ret.height = height;
    return ret;
  }, [width, height, style])

  return <C ref={ref} {...p} style={_style} />;
}
SVG.DefaultStorke = default_storke_styles;
