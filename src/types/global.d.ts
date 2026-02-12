declare const NODE_ENV: string;
declare const BUILD_TIME: string;
declare const API_BASE: string;
declare const WS_URL: string;
declare interface Window {
  is_sad_day?: boolean;
  is_red_day?: boolean;
}
/// <reference types="node" />
/// <reference types="react" />
/// <reference types="react-dom" />

declare namespace NodeJS {
  interface ProcessEnv {
    readonly NODE_ENV: 'development' | 'production' | 'test';
    readonly PUBLIC_URL: string;
  }
}

declare module '*.avif' {
  const src: string;
  export default src;
}

declare module '*.bmp' {
  const src: string;
  export default src;
}

declare module '*.gif' {
  const src: string;
  export default src;
}

declare module '*.jpg' {
  const src: string;
  export default src;
}

declare module '*.jpeg' {
  const src: string;
  export default src;
}

declare module '*.png' {
  const src: string;
  export default src;
}

declare module '*.webp' {
  const src: string;
  export default src;
}

declare interface ISvgProps extends React.SVGProps<SVGSVGElement> {
  title?: string
}
declare module '*.svg?react' {
  import React from 'react'
  const ReactComponent: React.FC<React.SVGProps<SVGSVGElement>>
  export default ReactComponent
}
declare module '*.svg' {
  import * as React from 'react';
  export const ReactComponent: React.FC<ISvgProps>;
  const src: string;
  export default src;
}

declare module '*.module.scss' {
  const classes: { readonly [key: string]: string };
  export default classes;
}

