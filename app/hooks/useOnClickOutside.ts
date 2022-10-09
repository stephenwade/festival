import type { RefObject } from 'react';
import { useEffect } from 'react';

export function useOnClickOutside(
  ref: RefObject<HTMLElement>,
  callback: (e: MouseEvent) => void
) {
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (!ref.current?.contains(e.target as Node)) {
        callback(e);
      }
    };

    document.addEventListener('click', handleClick);

    return () => {
      document.removeEventListener('click', handleClick);
    };
  }, [callback, ref]);
}
