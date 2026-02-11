import { useEffect } from 'react';

export function useMovingBg(el: HTMLElement | null | undefined) {
  useEffect(() => {
    if (!el) return;
    // let x = 0;
    // let y = 0;
    // let a = Math.random() * Math.PI;
    // const dis_step = 1;
    // const ang_step = 0.1;
    // const interval = 100;
    // const d = Math.random() > 0.5 ? -1 : 1;
    // const tid = setInterval(() => {
    //   a += ang_step * d;
    //   const xd = dis_step * Math.sin(a)
    //   const yd = dis_step * Math.cos(a)
    //   x = ((x + xd)) % 32;
    //   y = ((y + yd)) % 32;
    //   el.style.backgroundPosition = `${x}px ${y}px`;
    // }, interval);
    // return () => clearInterval(tid);
  }, [el]);
}
