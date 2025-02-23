import { useCallback, useEffect, useRef, useState } from 'react';
import { Temporal } from 'temporal-polyfill';

function getCurrentSecond() {
  return Math.floor(Temporal.Now.instant().epochMilliseconds / 1000);
}

export function useClock(enabled = true): void {
  const [, setCounter] = useState(0);
  const forceUpdate = useCallback(() => {
    setCounter((c) => c + 1);
  }, []);

  const lastSecond = useRef(getCurrentSecond());

  useEffect(() => {
    if (enabled) {
      const interval = setInterval(() => {
        const now = getCurrentSecond();
        if (lastSecond.current !== now) {
          lastSecond.current = now;
          forceUpdate();
        }
      }, 200);

      return () => {
        clearInterval(interval);
      };
    }
  }, [enabled, forceUpdate]);
}
