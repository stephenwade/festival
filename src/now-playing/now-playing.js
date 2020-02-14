import { html, PolymerElement } from '@polymer/polymer/polymer-element.js';
import moment from 'moment/src/moment.js';

export class NowPlaying extends PolymerElement {
  static get template() {
    return html`
      <span id="now-playing-description"></span>
    `;
  }

  static get properties() {
    return {
      sets: {
        type: Object
      },
      _now: {
        type: moment
      },
      _nowPlayingDescription: {
        type: String,
        computed: '_computeNowPlayingDescription(_now, sets)',
        observer: '_nowPlayingDescriptionChanged'
      }
    };
  }

  _computeNowPlayingDescription(_now, sets) {
    if (_now && sets) {
      const startTime = moment(sets[0].start);

      const beforeAllSets = _now.isBefore(startTime);
      if (beforeAllSets) {
        const calendarTime = startTime.calendar(null, {
          sameElse: function(now) {
            return (
              'dddd, MMMM D' +
              (this.year() === now.year() ? '' : ', YYYY') +
              ' [at] h:mm A'
            );
          }
        });
        return ['The show will start:', calendarTime];
      }

      for (const set of sets) {
        const thisStartTime = moment(set.start);

        const beforeThisSet = _now.isBefore(thisStartTime);
        if (beforeThisSet) {
          return [`The next set will start ${_now.to(thisStartTime)}`];
        }

        const duringThisSet = _now.isBefore(
          thisStartTime.add(set.length, 'seconds')
        );
        if (duringThisSet) {
          return [set.title];
        }
      }

      return ['The show is over'];
    }
  }

  _nowPlayingDescriptionChanged(_nowPlayingDescription) {
    this.$['now-playing-description'].innerText = _nowPlayingDescription.join(
      '\n'
    );
  }

  connectedCallback() {
    super.connectedCallback();

    this._updateNow();
    this._nowInterval = setInterval(() => {
      this._updateNow();
    }, 1000);
  }

  disconnectedCallback() {
    super.disconnectedCallback();

    clearInterval(this._nowInterval);
  }

  _updateNow() {
    this._now = moment();
  }
}

window.customElements.define('now-playing', NowPlaying);
