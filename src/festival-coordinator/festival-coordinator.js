import { PolymerElement } from '@polymer/polymer/polymer-element.js';
import {
  setDriftlessIntervalEverySecond,
  clearDriftless,
} from '../../lib/driftless/driftless.js';
import moment from 'moment/src/moment.js';

export class FestivalCoordinator extends PolymerElement {
  static get template() {
    return null;
  }

  static get properties() {
    return {
      setsData: {
        type: Object,
        observer: '_setsDataChanged',
      },
      targetShowStatus: {
        type: String,
        notify: true,
        value: 'WAITING_UNTIL_START',
      },
      targetAudioStatus: {
        type: Object,
        notify: true,
      },
    };
  }

  disconnectedCallback() {
    super.disconnectedCallback();

    this._clearTimer();
  }

  updateSetMetadata(detail) {
    const sets = this.setsData.sets;
    for (const set of sets) {
      if (set === detail.set) {
        set.length = detail.duration;
        set.endMoment = set.startMoment
          .clone()
          .add(set.length, 'seconds')
          // make sure next set event is ready before current set ends
          .subtract(1, 'seconds');
      }
    }
  }

  _setsDataChanged(setsData) {
    this._clearTimer();
    if (setsData) {
      this._prepareSets();
      this._setInitialTargetAudioStatus();
      this._setupTimer();
    }
  }

  _prepareSets() {
    this._addMomentsToSets();
    this._sortSets();
  }

  _addMomentsToSets() {
    this.setsData.sets.forEach((set) => {
      set.startMoment = moment(set.start);
      set.endMoment = set.startMoment
        .clone()
        .add(set.length, 'seconds')
        // make sure next set event is ready before current set ends
        .subtract(1, 'seconds');
    });
  }

  _sortSets() {
    this.setsData.sets.sort((a, b) => a.startMoment - b.startMoment);
  }

  _setupTimer() {
    this._tick();
    this._tickInterval = setDriftlessIntervalEverySecond(this._tick.bind(this));
  }

  _clearTimer() {
    clearDriftless(this._tickInterval);
  }

  _tick() {
    const now = moment();
    this._updateTargetShowStatus(now);
    this._updateTargetAudioStatus(now);
  }

  _getInitialSet(now) {
    const sets = this.setsData.sets;
    for (const set of sets) {
      if (now.isBefore(set.endMoment)) return set;
    }
    return null;
  }

  _getNextSet() {
    const sets = this.setsData.sets;
    const currentSet = this.targetAudioStatus.set;
    const currentSetId = sets.indexOf(currentSet);
    const nextSetId = currentSetId + 1;
    if (nextSetId < sets.length) return sets[nextSetId];
    return null;
  }

  _getTargetAudioStatusForSet(set, now) {
    if (set) {
      if (now.isBefore(set.startMoment)) {
        const secondsUntilSetFrac = set.startMoment.diff(
          now,
          'seconds',
          true /* do not truncate */
        );
        const secondsUntilSet = Math.round(secondsUntilSetFrac);
        return {
          set,
          secondsUntilSet,
          status: 'WAITING_UNTIL_START',
        };
      }

      const currentTimeFrac = now.diff(
        set.startMoment,
        'seconds',
        true /* do not truncate */
      );
      const currentTime = Math.round(currentTimeFrac);
      return {
        set,
        currentTime,
        status: 'PLAYING',
      };
    }

    return {
      set: null,
      status: 'ENDED',
    };
  }

  _setInitialTargetAudioStatus() {
    const now = moment();
    const currentSet = this._getInitialSet(now);

    this.targetAudioStatus = this._getTargetAudioStatusForSet(currentSet, now);
  }

  _updateTargetAudioStatus(now) {
    if (this.targetAudioStatus.status === 'ENDED') {
      this._clearTimer();
      return;
    }

    let set = this.targetAudioStatus.set;
    if (now.isAfter(set.endMoment)) set = this._getNextSet();

    this.targetAudioStatus = this._getTargetAudioStatusForSet(set, now);
  }

  _updateTargetShowStatus(now) {
    const sets = this.setsData.sets;

    switch (this.targetShowStatus) {
      case 'WAITING_UNTIL_START': {
        const firstSet = sets[0];
        if (firstSet && now.isSameOrAfter(firstSet.startMoment)) {
          this.targetShowStatus = 'IN_PROGRESS';
        } else break;
      }
      // fallthrough
      case 'IN_PROGRESS': {
        const lastSet = sets.slice(-1)[0];
        if (lastSet && now.isAfter(lastSet.endMoment)) {
          this.targetShowStatus = 'ENDED';
        } else break;
      }
      // fallthrough
      case 'ENDED':
        break;

      default:
        throw new Error('Unknown status');
    }
  }
}

window.customElements.define('festival-coordinator', FestivalCoordinator);
