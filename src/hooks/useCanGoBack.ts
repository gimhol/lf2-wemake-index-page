import { useEffect, useState } from "react";
import { useNavigationType } from "react-router";

export function useCanGoBack(): boolean {
  const navigationType = useNavigationType();
  const [canGoBack, setCanGoBack] = useState(false);
  useEffect(() => {
    // 哈希路由下的核心判断逻辑
    const checkCanGoBack = () => {
      const isAble = window.history.length > 1 && !(navigationType === 'POP' && window.history.length === 1);
      setCanGoBack(isAble);
    };

    checkCanGoBack();
    window.addEventListener('popstate', checkCanGoBack);
    window.addEventListener('hashchange', checkCanGoBack);
    return () => {
      window.removeEventListener('popstate', checkCanGoBack);
      window.removeEventListener('hashchange', checkCanGoBack);
    };
  }, [navigationType]);
  return canGoBack
}