import { PolymerElement } from '@polymer/polymer/polymer-element.js';
import {
  setDriftlessIntervalEverySecond,
  clearDriftless
} from '../../lib/driftless/driftless.js';
import moment from 'moment';

export class FestivalCoordinator extends PolymerElement {
  static get template() {
    return null;
  }

  static get properties() {
    return {
      setsData: {
        type: Object,
        observer: '_setsDataChanged'
      },
      targetShowStatus: {
        type: String,
        notify: true,
        value: 'WAITING_UNTIL_START'
      },
      targetAudioStatus: {
        type: Object,
        notify: true
      }
    };
  }

  disconnectedCallback() {
    super.disconnectedCallback();

    this._clearTimer();
  }

  _setsDataChanged(setsData) {
    this._clearTimer();
    if (setsData) {
      this._addMomentsToSets();
      this._setupTimer();
    }
  }

  _addMomentsToSets() {
    this.setsData.sets.forEach(set => {
      set.startMoment = moment(set.start);
      set.endMoment = set.startMoment.clone().add(set.length, 'seconds');
    });
  }

  _clearTimer() {
    clearDriftless(this._tickInterval);
  }

  _setupTimer() {
    this._tick();
    this._tickInterval = setDriftlessIntervalEverySecond(this._tick.bind(this));
  }

  _tick() {
    const now = moment();
    this._updateTargetShowStatus(now);
    this._updateTargetAudioStatus(now);
  }

  _updateTargetShowStatus(now) {
    const sets = this.setsData.sets;
    const firstSet = sets[0];
    const lastSet = sets.slice(-1)[0];

    switch (this.targetShowStatus) {
      case 'WAITING_UNTIL_START':
        if (now.isSameOrAfter(firstSet.startMoment)) {
          this.targetShowStatus = 'IN_PROGRESS';
        }
      // fallthrough
      case 'IN_PROGRESS':
        if (now.isAfter(lastSet.endMoment)) {
          this.targetShowStatus = 'ENDED';
        }
        break;

      case 'ENDED':
        break;

      default:
        throw new Error('Unknown status');
    }
  }

  _updateTargetAudioStatus(now) {
    let targetAudioStatus;

    const sets = this.setsData.sets;

    for (const set of sets) {
      if (now.isBefore(set.startMoment)) {
        const secondsFracUntilSet = set.startMoment.diff(now, 'seconds', true);
        const secondsUntilSet = Math.round(secondsFracUntilSet);
        targetAudioStatus = {
          set,
          secondsUntilSet,
          status: 'WAITING_UNTIL_START'
        };
        break;
      }
      if (now.isBefore(set.endMoment)) {
        const currentTimeFracInSet = now.diff(set.startMoment, 'seconds', true);
        const currentTime = Math.round(currentTimeFracInSet);
        targetAudioStatus = {
          set,
          currentTime,
          status: 'PLAYING'
        };
        break;
      }
    }
    if (!targetAudioStatus) {
      targetAudioStatus = null;
    }

    this.targetAudioStatus = targetAudioStatus;
  }
}

window.customElements.define('festival-coordinator', FestivalCoordinator);
