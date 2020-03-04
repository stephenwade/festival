import { PolymerElement } from '@polymer/polymer/polymer-element.js';
import { ActionMixin } from '../../lib/mixins/action-mixin.js';
import {
  setDriftlessIntervalEverySecond,
  clearDriftless
} from '../../lib/driftless/driftless.js';
import moment from 'moment';

export class FestivalCoordinator extends ActionMixin(PolymerElement) {
  static get template() {
    return null;
  }

  static get properties() {
    return {
      state: Object,
      _targetShowStatus: {
        type: String,
        observer: '_targetShowStatusChanged'
      }
    };
  }

  static get observers() {
    return [
      '_setupSets(state.setsData)',
      '_setupTimer(state.setsLoaded, state.setsData)'
    ];
  }

  disconnectedCallback() {
    super.disconnectedCallback();

    clearDriftless(this._tickInterval);
  }

  _targetShowStatusChanged(targetShowStatus) {
    if (targetShowStatus !== this.state.targetShowStatus)
      this.fireAction('UPDATE_TARGET_SHOW_STATUS', { targetShowStatus });
  }

  _setupSets(setsData) {
    if (setsData) {
      setsData.sets.forEach(set => {
        set.startMoment = moment(set.start);
        set.endMoment = set.startMoment.clone().add(set.length, 'seconds');
      });
    }
  }

  _setupTimer(setsLoaded) {
    clearDriftless(this._tickInterval);
    if (setsLoaded) {
      this._tick();
      this._tickInterval = setDriftlessIntervalEverySecond(
        this._tick.bind(this)
      );
    }
  }

  _tick() {
    const now = moment();
    this._updateShowStatus(now);
    this._updateSetsStatus(now);
  }

  _updateShowStatus(now) {
    const sets = this.state.setsData.sets;
    const firstSet = sets[0];
    const lastSet = sets.slice(-1)[0];

    switch (this._targetShowStatus) {
      case undefined:
        this._targetShowStatus = 'WAITING_UNTIL_START';
      // fallthrough
      case 'WAITING_UNTIL_START':
        if (now.isSameOrAfter(firstSet.startMoment)) {
          this._targetShowStatus = 'IN_PROGRESS';
        }
      // fallthrough
      case 'IN_PROGRESS':
        if (now.isAfter(lastSet.endMoment)) {
          this._targetShowStatus = 'ENDED';
        }
        break;

      case 'ENDED':
        break;

      default:
        throw new Error('Unknown status');
    }
  }

  _updateSetsStatus(now) {
    let currentSet;

    const sets = this.state.setsData.sets;

    for (const set of sets) {
      if (now.isBefore(set.startMoment)) {
        const secondsFracUntilSet = set.startMoment.diff(now, 'seconds', true);
        const secondsUntilSet = Math.round(secondsFracUntilSet);
        currentSet = {
          set,
          secondsUntilSet,
          status: 'WAITING_UNTIL_START'
        };
        break;
      }
      if (now.isBefore(set.endMoment)) {
        const currentTimeFracInSet = now.diff(set.startMoment, 'seconds', true);
        const currentTime = Math.round(currentTimeFracInSet);
        currentSet = {
          set,
          currentTime,
          status: 'PLAYING'
        };
        break;
      }
    }
    if (!currentSet) {
      currentSet = null;
    }

    if (currentSet !== this._currentSet) {
      this._currentSet = currentSet;
      this.fireAction('UPDATE_TARGET_SETS_STATUS', { currentSet });
    }
  }
}

window.customElements.define('festival-coordinator', FestivalCoordinator);
