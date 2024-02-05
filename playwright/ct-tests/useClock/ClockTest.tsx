import { useEffect, useRef } from 'react';

import { useClock } from '~/hooks/useClock';

function useRenderCount() {
  const count = useRef(1);
  useEffect(() => {
    count.current += 1;
  });
  return count.current;
}

export function ClockTest() {
  useClock();

  const count = useRenderCount();
  return <div>{count}</div>;
}
