import { useState, useEffect } from 'react';



export function useSmallScreen() {
  const [r, s] = useState(!!document.firstElementChild?.classList.contains('small-screen'));
  useEffect(() => {
    const on_resize = () => {
      s(!!document.firstElementChild?.classList.contains('small-screen'));
    };
    window.addEventListener('resize', on_resize);
  });
  return r;
}
