import { useEffect, useState } from 'react';

const init = (): 's' | 'm' | 'l' => {
  const cl = document.firstElementChild?.classList
  if (!cl) return 'm'
  if (window.innerWidth <= 480) return 's'
  else if (window.innerWidth <= 1600) return 'm'
  else return 'l'
}
export function useScreenType(): 's' | 'm' | 'l' {
  const [value, set_value] = useState(init);
  useEffect(() => {
    const on_resize = () => {
      set_value(init());
    };
    window.addEventListener('resize', on_resize);
  });
  return value;
}
