import { useEffect, useRef, useState } from 'react';

function getCurrentSecond() {
  return Math.floor(Date.now() / 1000);
}

export function useClock(enabled = true): void {
  const [, forceUpdate] = useState(0);

  const lastSecond = useRef(getCurrentSecond());

  useEffect(() => {
    if (enabled) {
      const interval = setInterval(() => {
        const now = getCurrentSecond();
        if (lastSecond.current !== now) {
          lastSecond.current = now;
          forceUpdate((x) => x + 1);
        }
      }, 200);

      return () => {
        clearInterval(interval);
      };
    }
  }, [enabled]);
}
