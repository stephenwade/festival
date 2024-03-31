import type { LinksFunction } from '@remix-run/node';
import type { FC, KeyboardEventHandler } from 'react';
import { memo, useCallback, useRef, useState } from 'react';
import { useOnClickOutside } from 'usehooks-ts';

import { VolumeDownIcon, VolumeMuteIcon, VolumeUpIcon } from './icons';
import stylesUrl from './volume-fab.css?url';

const INPUT_MIN = 0;
const INPUT_MAX = 100;
const INPUT_STEP = 5;

export const links: LinksFunction = () => [
  { rel: 'stylesheet', href: stylesUrl },
];

export interface VolumeFabProps {
  volume: number;
  onVolumeInput: (volume: number) => void;
}

export const VolumeFab: FC<VolumeFabProps> = memo(function VolumeFab({
  volume,
  onVolumeInput,
}: VolumeFabProps) {
  const [opened, setOpened] = useState(false);

  const close = useCallback(() => {
    setOpened(false);
  }, []);

  const buttonRef = useRef<HTMLDivElement>(null);

  useOnClickOutside(buttonRef, close);

  const handleKeyDown: KeyboardEventHandler<HTMLButtonElement> = (e) => {
    if (e.ctrlKey || e.altKey || e.metaKey) return;

    switch (e.key) {
      case 'ArrowLeft':
      case 'ArrowDown':
        onVolumeInput(volume - INPUT_STEP);
        break;

      case 'ArrowRight':
      case 'ArrowUp':
        onVolumeInput(volume + INPUT_STEP);
        break;

      case 'PageUp':
        onVolumeInput(volume + INPUT_STEP * 2);
        break;

      case 'PageDown':
        onVolumeInput(volume - INPUT_STEP * 2);
        break;

      case 'Home':
        onVolumeInput(INPUT_MIN);
        break;

      case 'End':
        onVolumeInput(INPUT_MAX);
        break;
    }
  };

  const VolumeIcon =
    volume === INPUT_MIN
      ? VolumeMuteIcon
      : volume < (INPUT_MIN + INPUT_MAX) / 2
        ? VolumeDownIcon
        : VolumeUpIcon;

  return (
    <div ref={buttonRef} className="volume-fab-container">
      <button
        className={`elevation-transition ${
          opened ? 'elevation-z12' : 'elevation-z6'
        }`}
        aria-label="Volume"
        onClick={() => {
          setOpened((opened) => !opened);
        }}
        onKeyDown={handleKeyDown}
      >
        <VolumeIcon />
      </button>
      <div
        className={`slider-container elevation-transition ${
          opened ? 'elevation-z12-r90' : 'elevation-z0'
        }`}
        aria-expanded={opened}
      >
        <input
          className="styled-range-input"
          type="range"
          defaultValue={volume}
          min={INPUT_MIN}
          max={INPUT_MAX}
          step={INPUT_STEP}
          aria-label="Volume"
          disabled={!opened}
          onInput={(e) => {
            const input = e.target as HTMLInputElement;
            const volume = Number(input.value);
            onVolumeInput?.(volume);
          }}
        />
      </div>
    </div>
  );
});
