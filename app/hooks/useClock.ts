import { useEffect, useRef, useState } from 'react';

export function useClock(enabled = true): void {
  const [, forceUpdate] = useState(0);

  const getCurrentSecond = () => Math.floor(Date.now() / 1000);

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
