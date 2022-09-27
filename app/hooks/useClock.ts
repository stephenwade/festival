import { useEffect, useRef } from 'react';

type UseClockProps = {
  onTick: () => void;
  enabled?: boolean;
};

export function useClock({ onTick, enabled = true }: UseClockProps): void {
  const getCurrentSecond = () => Math.floor(Date.now() / 1000);

  const lastSecond = useRef(getCurrentSecond());

  useEffect(() => {
    if (enabled) {
      const interval = setInterval(() => {
        const now = getCurrentSecond();
        if (lastSecond.current !== now) {
          lastSecond.current = now;
          onTick();
        }
      }, 200);

      return () => {
        clearInterval(interval);
      };
    }
  }, [enabled, onTick]);
}
