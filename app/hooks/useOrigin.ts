import { useEffect, useState } from 'react';

export function useOrigin() {
  const [origin, setOrigin] = useState<string>();

  useEffect(() => {
    setOrigin(globalThis.location.origin);
  }, []);

  return origin;
}
