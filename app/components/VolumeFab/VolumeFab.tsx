import './volume-fab.css';

import type { Dispatch, FC, SetStateAction } from 'react';
import { memo, useCallback, useEffect, useRef, useState } from 'react';
import { useOnClickOutside } from 'usehooks-ts';

import { VolumeDownIcon, VolumeMuteIcon, VolumeUpIcon } from './icons';

const INPUT_MIN = 0;
const INPUT_MAX = 100;
const INPUT_STEP = 5;

export interface VolumeFabProps {
  volume: number;
  onVolumeInput: Dispatch<SetStateAction<number>>;
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

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.ctrlKey || e.altKey || e.metaKey) return;

      switch (e.key) {
        case 'ArrowUp':
        case 'ArrowRight':
          onVolumeInput((v) => Math.min(v + INPUT_STEP, INPUT_MAX));
          break;

        case 'ArrowDown':
        case 'ArrowLeft':
          onVolumeInput((v) => Math.max(v - INPUT_STEP, INPUT_MIN));
          break;

        case 'PageUp':
          onVolumeInput((v) => Math.min(v + INPUT_STEP * 2, INPUT_MAX));
          break;

        case 'PageDown':
          onVolumeInput((v) => Math.max(v - INPUT_STEP * 2, INPUT_MIN));
          break;

        case 'Home':
          onVolumeInput(INPUT_MIN);
          break;

        case 'End':
          onVolumeInput(INPUT_MAX);
          break;
      }
    },
    [onVolumeInput],
  );

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [handleKeyDown]);

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
          value={volume}
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
