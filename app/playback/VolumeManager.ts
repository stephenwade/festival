import type { SetStateAction } from 'react';
import { z } from 'zod';

import type { Listener, Unsubscribe } from './ListenerSet';
import { ListenerSet } from './ListenerSet';

const VOLUME_KEY = 'volume';
const LAST_POSITIVE_VOLUME_KEY = 'lastPositiveVolume';

export class VolumeManager {
  private volume_: number;
  private lastPositiveVolume: number;

  private volumeListeners = new ListenerSet<number>();

  constructor() {
    this.volume_ = readNumberFromLocalStorage(VOLUME_KEY) ?? 100;
    this.lastPositiveVolume =
      readNumberFromLocalStorage(LAST_POSITIVE_VOLUME_KEY) ??
      (this.volume === 0 ? 100 : this.volume);
  }

  get volume() {
    return this.volume_;
  }

  addVolumeListener(listener: Listener<number>): Unsubscribe {
    return this.volumeListeners.subscribe(listener);
  }

  setVolume(volume: SetStateAction<number>) {
    const newVolume =
      typeof volume === 'function' ? volume(this.volume) : volume;

    this.volume_ = newVolume;
    saveToLocalStorage(VOLUME_KEY, newVolume);

    if (newVolume > 0) {
      this.lastPositiveVolume = newVolume;
      saveToLocalStorage(LAST_POSITIVE_VOLUME_KEY, newVolume);
    }

    this.volumeListeners.emit(this.volume);
  }

  toggleMute() {
    if (this.volume === 0) {
      this.setVolume(this.lastPositiveVolume);
    } else {
      this.setVolume(0);
    }
  }

  dispose() {
    this.volumeListeners.clear();
  }
}

function readNumberFromLocalStorage(key: string): number | null {
  try {
    const string = globalThis.localStorage.getItem(key);
    if (string) {
      const number = z.number().parse(JSON.parse(string));
      return number;
    }
  } catch {
    // ignore errors
  }
  return null;
}

function saveToLocalStorage(key: string, value: unknown) {
  try {
    globalThis.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // ignore errors
  }
}
