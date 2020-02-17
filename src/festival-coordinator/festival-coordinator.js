import { PolymerElement } from '@polymer/polymer/polymer-element.js';
import { ActionMixin } from '../../lib/mixins/action-mixin.js';
import {
  setDriftlessTimeout,
  setDriftlessInterval,
  clearDriftless
} from '../../lib/driftless/driftless.js';
import moment from 'moment';
import 'lodash'; /* global _ */

export class FestivalCoordinator extends ActionMixin(PolymerElement) {
  static get template() {
    return null;
  }

  static get properties() {
    return {
      state: Object
    };
  }

  static get observers() {
    return ['_setupSets(state.setsData)', '_setupTimer(state.setsLoaded)'];
  }

  _setupSets(setsData) {
    if (setsData) {
      this._sets = _.cloneDeep(setsData.sets);
      for (let i = 0; i < this._sets.length; ++i) {
        const set = this._sets[i];
        set.start = moment(set.start);
        set.end = set.start.clone().add(set.length, 'seconds');
      }
    }
  }

  _setupTimer(setsLoaded) {
    clearDriftless(this._tickInterval);
    if (setsLoaded) {
      this._tick();
      const millisecondsUntilNextSecond = new Date().getMilliseconds();
      this._tickInterval = setDriftlessTimeout(() => {
        this._tickInterval = setDriftlessInterval(this._tick.bind(this), 1000);
      }, millisecondsUntilNextSecond);
    }
  }

  _tick() {
    const now = moment();
    this._updateShowStatus(now);
  }

  _updateShowStatus(now) {
    let showStatus;

    const firstSet = this._sets[0];
    const lastSet = this._sets.slice(-1)[0];

    if (now.isBefore(firstSet.start)) {
      showStatus = 'NOT_STARTED';
    } else if (now.isAfter(lastSet.end)) {
      showStatus = 'ENDED';
    } else {
      showStatus = 'IN_PROGRESS';
    }

    if (showStatus !== this._showStatus) {
      this._showStatus = showStatus;
      this.fireAction('UPDATE_SHOW_STATUS', { showStatus });
    }
  }
}

window.customElements.define('festival-coordinator', FestivalCoordinator);
