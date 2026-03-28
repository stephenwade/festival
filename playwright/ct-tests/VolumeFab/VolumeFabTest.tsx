import { useEffect, useState } from 'react';

import { VolumeFab } from '../../../app/components/VolumeFab';
import { useVolume } from '../../../app/hooks/useVolume';
import { INITIAL_VOLUME } from './shared-data';

export function VolumeFabTest() {
  const { volume, setVolume } = useVolume();
  const [firstRender, setFirstRender] = useState(true);

  useEffect(() => {
    setVolume(INITIAL_VOLUME);
    setFirstRender(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return firstRender ? null : (
    <>
      <VolumeFab />
      <p>Volume: {volume}</p>
    </>
  );
}
