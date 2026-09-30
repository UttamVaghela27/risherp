import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

/**
 * ScrollToTop Component
 * Automatically resets window, document, and layout scroll positions to top (0, 0)
 * whenever navigation to a different route/page occurs.
 */
const ScrollToTop = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    // Reset window scroll position instantly
    try {
      window.scrollTo({
        top: 0,
        left: 0,
        behavior: 'instant',
      });
    } catch {
      window.scrollTo(0, 0);
    }

    // Reset document element and body scroll positions
    if (document.documentElement) {
      document.documentElement.scrollTop = 0;
    }
    if (document.body) {
      document.body.scrollTop = 0;
    }

    // Reset any scrollable main container elements
    const mainEl = document.querySelector('main');
    if (mainEl) {
      mainEl.scrollTop = 0;
    }

    const rootEl = document.getElementById('root');
    if (rootEl) {
      rootEl.scrollTop = 0;
    }

    // Backup rAF execution in case layout rendering shifts scroll position slightly
    const rafId = requestAnimationFrame(() => {
      window.scrollTo(0, 0);
      if (document.documentElement) document.documentElement.scrollTop = 0;
      if (document.body) document.body.scrollTop = 0;
      if (mainEl) mainEl.scrollTop = 0;
    });

    return () => cancelAnimationFrame(rafId);
  }, [pathname]);

  return null;
};

export default ScrollToTop;
