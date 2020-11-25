import { LitElement, html } from 'lit-element';
import { connect } from 'pwa-helpers/connect-mixin.js';
import { AudioContext } from 'standardized-audio-context';
import { differenceInSeconds } from 'date-fns';

import { store } from '../store.js';
import { setShowStatus } from '../actions/showStatus.js';
import {
  audioEnded,
  audioPaused,
  audioPlaying,
  audioStalled,
  audioWaiting,
} from '../actions/audioStatus.js';

export class FestivalAudio extends connect(store)(LitElement) {
  constructor() {
    super();

    this._changeQueue = [];

    this._boundAudioEvents = {
      ended: this._handleAudioEnded.bind(this),
      error: this._handleAudioError.bind(this),
      loadedmetadata: this._handleAudioLoadedMetadata.bind(this),
      pause: this._handleAudioPause.bind(this),
      playing: this._handleAudioPlaying.bind(this),
      stalled: this._handleAudioStalled.bind(this),
      timeupdate: this._handleAudioTimeUpdate.bind(this),
      waiting: this._handleAudioWaiting.bind(this),
    };
  }

  render() {
    return html`
      <audio id="audio1" crossorigin="anonymous"></audio>
      <audio id="audio2" crossorigin="anonymous"></audio>
    `;
  }

  firstUpdated() {
    this._audioElements = [
      this.shadowRoot.getElementById('audio1'),
      this.shadowRoot.getElementById('audio2'),
    ];

    this._audioElements.forEach((audio) => {
      Object.keys(this._boundAudioEvents).forEach((event) => {
        const handler = this._boundAudioEvents[event];
        audio.addEventListener(event, handler);
      });
    });

    [this._activeAudio, this._inactiveAudio] = this._audioElements;
  }

  disconnectedCallback() {
    this._audioElements.forEach((audio) => {
      Object.keys(this._boundAudioEvents).forEach((event) => {
        const handler = this._boundAudioEvents[event];
        audio.removeEventListener(event, handler);
      });
    });

    super.disconnectedCallback();
  }

  stateChanged(state) {
    this._checkTargetShowStatus();
    if (this._setGain) this._setGain(state.settings.volume / 100);
  }

  init() {
    const { targetShowStatus } = store.getState();
    if (targetShowStatus.status === 'ENDED') return;

    // skip setting up AudioContext on iOS
    const iOS = /iPad|iPhone|iPod/u.test(navigator.userAgent);
    if (!iOS) {
      try {
        this._setupAudioContext();
      } catch (e) {
        // ignore errors
      }
    }

    this._audioElements.forEach((audio) => {
      // Safari: activate the audio element by trying to play
      audio.play().catch(() => {
        // ignore errors
      });
      // Firefox: if you don't pause after trying to play, it will start to play
      // as soon as src is set
      audio.pause();
    });

    if (!this._audioContext) {
      this._handleAudioContextResumed();
    } else {
      this._audioContext
        .resume()
        .then(this._handleAudioContextResumed.bind(this));
    }
  }

  _setupAudioContext() {
    this._audioContext = new AudioContext();

    const tracks = this._audioElements.map((audio) =>
      this._audioContext.createMediaElementSource(audio)
    );

    const analyserNode = this._audioContext.createAnalyser();
    analyserNode.fftSize = 1024;
    analyserNode.minDecibels = -85;
    analyserNode.smoothingTimeConstant = 0.7;

    const audioVisualizerData = new Uint8Array(analyserNode.frequencyBinCount);

    const gainNode = this._audioContext.createGain();
    this._setGain = (gain) => {
      if (gain < 0) gainNode.gain.value = 0;
      else if (gain > 1) gainNode.gain.value = 1;
      else gainNode.gain.value = gain;
    };

    const { settings } = store.getState();
    this._setGain(settings.volume / 100);

    tracks.forEach((track) => {
      track
        .connect(analyserNode)
        .connect(gainNode)
        .connect(this._audioContext.destination);
    });

    const getAudioVisualizerData = () => {
      analyserNode.getByteFrequencyData(audioVisualizerData);
      return audioVisualizerData;
    };

    this.dispatchEvent(
      new CustomEvent('visualizer-data-available', {
        bubbles: true,
        composed: true,
        detail: { getAudioVisualizerData },
      })
    );
  }

  _handleAudioContextResumed() {
    const newShowStatus = {
      status: 'WAITING_UNTIL_START',
    };
    store.dispatch(setShowStatus(newShowStatus));
    this._checkTargetShowStatus();
  }

  _checkTargetShowStatus() {
    if (this._error) return;

    const { targetShowStatus, showStatus } = store.getState();

    const ended = targetShowStatus && targetShowStatus.status === 'ENDED';
    const waitingForAudioContext =
      showStatus.status === 'WAITING_FOR_AUDIO_CONTEXT';

    if (waitingForAudioContext && !ended) return;

    const firstRun = !this._lastTargetShowStatus;
    if (firstRun) {
      this._lastTargetShowStatus = targetShowStatus;
      this._queueStatusChange(targetShowStatus);
    } else {
      const statusChanged =
        targetShowStatus.status !== this._lastTargetShowStatus.status;
      const setChanged =
        targetShowStatus.set !== this._lastTargetShowStatus.set;
      const secondsUntilSetChanged =
        targetShowStatus.secondsUntilSet !==
        this._lastTargetShowStatus.secondsUntilSet;
      const currentTimeChanged =
        targetShowStatus.currentTime !== this._lastTargetShowStatus.currentTime;

      this._lastTargetShowStatus = targetShowStatus;

      if (statusChanged || setChanged) {
        this._queueStatusChange(targetShowStatus);
      } else if (secondsUntilSetChanged || currentTimeChanged) {
        this._updateTime(targetShowStatus);
      }
    }
  }

  _queueStatusChange(change) {
    const { showStatus } = store.getState();

    switch (showStatus.status) {
      case 'WAITING_FOR_AUDIO_CONTEXT':
      case 'WAITING_UNTIL_START':
      case 'DELAYING_FOR_INITIAL_SYNC':
      case 'ENDED':
        this._performStatusChange(change);
        break;

      case 'PLAYING':
        this._changeQueue.push(change);
        break;

      default:
        throw new Error('Unknown status');
    }
  }

  _performStatusChange(change) {
    const { showStatus } = store.getState();

    const setChanged = change.set !== showStatus.set;
    const nextSrcAlreadySet = Boolean(this._activeAudio.src);
    const shouldChangeSrc = setChanged && !nextSrcAlreadySet;

    let newShowStatus;

    switch (change.status) {
      case 'WAITING_UNTIL_START':
        if (shouldChangeSrc) this._activeAudio.src = change.set.audio;

        newShowStatus = {
          set: change.set,
          status: 'WAITING_UNTIL_START',
          secondsUntilSet: change.secondsUntilSet,
          nextSet: change.nextSet,
        };
        break;

      case 'PLAYING':
        if (shouldChangeSrc) this._activeAudio.src = change.set.audio;

        if (change.currentTime > 0) {
          // delay 2 seconds for audio to load
          const delayingUntil = change.currentTime + 2;

          newShowStatus = {
            set: change.set,
            status: 'DELAYING_FOR_INITIAL_SYNC',
            delayingUntil,
            nextSet: change.nextSet,
          };
          this._activeAudio.src += `#t=${delayingUntil}`;
        } else {
          this._activeAudio.play().catch(this._handleAudioError.bind(this));

          newShowStatus = {
            set: change.set,
            status: 'PLAYING',
            currentTime: 0,
            nextSet: change.nextSet,
          };
        }
        break;

      case 'ENDED':
        newShowStatus = { status: 'ENDED' };
        break;

      default:
        throw new Error('Unknown status');
    }

    store.dispatch(setShowStatus(newShowStatus));

    if (newShowStatus.status !== 'PLAYING') {
      const nextChange = this._changeQueue.shift();
      if (nextChange) this._performStatusChange(nextChange);
    }
  }

  _updateTime(change) {
    const { showStatus } = store.getState();

    let newShowStatus;

    switch (showStatus.status) {
      case 'WAITING_UNTIL_START':
        newShowStatus = {
          ...showStatus,
          secondsUntilSet: change.secondsUntilSet,
        };
        break;

      case 'DELAYING_FOR_INITIAL_SYNC':
        if (change.currentTime >= showStatus.delayingUntil) {
          this._activeAudio.play();

          newShowStatus = {
            set: change.set,
            status: 'PLAYING',
            currentTime: showStatus.delayingUntil,
          };
        }
        break;

      case 'PLAYING':
        newShowStatus = {
          ...showStatus,
          delay: this._getDelay(change),
        };
        break;

      // no default
    }

    if (newShowStatus) store.dispatch(setShowStatus(newShowStatus));
  }

  _getDelay(change) {
    const { showStatus } = store.getState();

    let delay = change.currentTime - this._activeAudio.currentTime;
    if (change.set !== showStatus.set) {
      const setDifference = differenceInSeconds(
        change.set.startDate,
        showStatus.set.startDate
      );
      delay += setDifference;
    }

    if (delay < 0) return 0;
    return delay;
  }

  _clearAndSwitchActiveAudio() {
    this._activeAudio.removeAttribute('src');

    // prettier-ignore
    // swap _activeAudio and _inactiveAudio
    [this._activeAudio, this._inactiveAudio] =
      [this._inactiveAudio, this._activeAudio];
  }

  _handleAudioEnded(e) {
    if (e.target !== this._activeAudio) return;

    this._clearAndSwitchActiveAudio();

    const newShowStatus = {
      status: 'WAITING_UNTIL_START',
    };
    store.dispatch(setShowStatus(newShowStatus));

    const nextChange = this._changeQueue.shift();
    if (nextChange) this._performStatusChange(nextChange);

    store.dispatch(audioEnded());

    clearTimeout(this._stalledTimeout);
  }

  _handleAudioTimeUpdate(e) {
    if (e.target !== this._activeAudio) return;

    const { showStatus } = store.getState();

    if (showStatus.status === 'PLAYING') {
      const { currentTime } = this._activeAudio;

      const newShowStatus = {
        ...showStatus,
        currentTime,
      };
      store.dispatch(setShowStatus(newShowStatus));

      const nextSrcAlreadySet = Boolean(this._inactiveAudio.src);
      const nextSetAvailable = Boolean(showStatus.nextSet);
      const lessThanOneMinuteLeft =
        showStatus.set.length - showStatus.currentTime <= 60;
      const shouldPreloadNextSet =
        !nextSrcAlreadySet && nextSetAvailable && lessThanOneMinuteLeft;
      if (shouldPreloadNextSet) {
        this._inactiveAudio.src = showStatus.nextSet.audio;
      }
    }
  }

  _handleAudioError() {
    this.dispatchEvent(
      new CustomEvent('error', { bubbles: true, composed: true })
    );
    this._error = true;
  }

  _handleAudioWaiting(e) {
    if (e.target !== this._activeAudio) return;

    store.dispatch(audioWaiting());

    this._stalledTimeout = setTimeout(
      this._handleAudioStalled.bind(this),
      10 * 1000
    );
  }

  _handleAudioPlaying(e) {
    if (e.target !== this._activeAudio) return;

    store.dispatch(audioPlaying());

    clearTimeout(this._stalledTimeout);
  }

  _handleAudioPause(e) {
    if (e.target !== this._activeAudio) return;

    store.dispatch(audioPaused());
  }

  _handleAudioStalled(e) {
    if (
      e && // this function can be called without an event object
      e.target !== this._activeAudio
    )
      return;

    // Safari: only listen to stalled event if audio is waiting
    if (!this.audioWaiting) return;

    store.dispatch(audioStalled());
  }

  _handleAudioLoadedMetadata(e) {
    const { showStatus } = store.getState();

    const set =
      e.target === this._activeAudio ? showStatus.set : showStatus.nextSet;

    if (!set) return;

    this.dispatchEvent(
      new CustomEvent('loadedmetadata', {
        bubbles: true,
        composed: true,
        detail: {
          set,
          duration: e.target.duration,
        },
      })
    );
  }
}

window.customElements.define('festival-audio', FestivalAudio);
