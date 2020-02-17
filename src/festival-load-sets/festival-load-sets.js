import moment from 'moment/src/moment.js';
import { ActionMixin } from '../../lib/mixins/action-mixin.js';

export class FestivalLoadSets extends ActionMixin(HTMLElement) {
  loadData() {
    // always use mock data for now
    this.fireAction('SETS_LOADED', { data: this._getMockData() });
  }

  _getMockData() {
    return {
      sets: [
        {
          audio: '/public/mock/not-enough.mp3',
          title: 'Anavae – Not Enough Instrumental',
          start: moment()
            .add(5, 'seconds')
            .toISOString(),
          length: 224.03
        },
        {
          audio: '/public/mock/modern.mp3',
          title: 'bignic – Modern',
          start: moment()
            .add(229, 'seconds')
            .toISOString(),
          length: 186.44
        },
        {
          audio: '/public/mock/how-i-love.mp3',
          title: 'Mayhem – How I Love',
          start: moment()
            .add(632, 'seconds')
            .toISOString(),
          length: 192.89
        },
        {
          audio: '/public/mock/wonderland.mp3',
          title: 'Griffin McElroy – Wonderland Round Three',
          start: moment()
            .add(855, 'seconds')
            .toISOString(),
          length: 156.92
        }
      ]
    };
  }
}

window.customElements.define('festival-load-sets', FestivalLoadSets);
