import type { LinksFunction } from '@remix-run/node';
import type { FC, KeyboardEventHandler } from 'react';
import { memo, useCallback, useRef, useState } from 'react';
import { useOnClickOutside } from 'usehooks-ts';

import { VolumeDownIcon, VolumeMuteIcon, VolumeUpIcon } from './icons';
import stylesUrl from './volume-fab.css';

const INPUT_MIN = 0;
const INPUT_MAX = 100;
const INPUT_STEP = 5;

export const links: LinksFunction = () => [
  { rel: 'stylesheet', href: stylesUrl },
];

interface Props {
  volume: number;
  onVolumeChange?: (volume: number) => void;
  onVolumeInput?: (volume: number) => void;
}

export const VolumeFab: FC<Props> = memo(function VolumeFab({
  volume,
  onVolumeChange,
  onVolumeInput,
}: Props) {
  const [opened, setOpened] = useState(false);

  const close = useCallback(() => {
    setOpened(false);
  }, []);

  const buttonRef = useRef<HTMLDivElement>(null);

  useOnClickOutside(buttonRef, close);

  const updateVolume = (volume: number) => {
    onVolumeChange?.(volume);
    onVolumeInput?.(volume);
  };

  const handleKeyDown: KeyboardEventHandler<HTMLButtonElement> = (e) => {
    if (e.ctrlKey || e.altKey || e.metaKey) return;

    switch (e.key) {
      case 'ArrowLeft':
      case 'ArrowDown':
        updateVolume(volume - INPUT_STEP);
        break;

      case 'ArrowRight':
      case 'ArrowUp':
        updateVolume(volume + INPUT_STEP);
        break;

      case 'PageUp':
        updateVolume(volume + INPUT_STEP * 2);
        break;

      case 'PageDown':
        updateVolume(volume - INPUT_STEP * 2);
        break;

      case 'Home':
        updateVolume(INPUT_MIN);
        break;

      case 'End':
        updateVolume(INPUT_MAX);
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
          onChange={(e) => {
            const input = e.target as HTMLInputElement;
            const volume = Number(input.value);
            onVolumeChange?.(volume);
          }}
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
