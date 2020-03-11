import { PolymerElement } from '@polymer/polymer/polymer-element.js';
import moment from 'moment/src/moment.js';

export class FestivalLoadSets extends PolymerElement {
  static get template() {
    return null;
  }

  static get properties() {
    return {
      setsData: {
        type: Object,
        notify: true
      }
    };
  }

  loadData() {
    // always use mock data for now
    this.setsData = this._getMockData();
  }

  _getMockData() {
    const m = moment().startOf('second');
    return {
      sets: [
        {
          audio: '/public/mock/not-enough.mp3',
          artist: 'Anavae',
          members: ['Rebecca Need-Menear', 'Jamie Finch'],
          start: m
            .clone()
            .add(5, 'seconds')
            .toISOString(),
          length: 224.03
        },
        {
          audio: '/public/mock/modern.mp3',
          artist: 'bignic',
          members: ['Nic Gorissen', '@tehbignic'],
          start: m
            .clone()
            .add(234, 'seconds')
            .toISOString(),
          length: 186.44
        },
        {
          audio: '/public/mock/how-i-love.mp3',
          artist: 'Ren Queenston',
          members: [
            'Mayhem',
            'LapFox Trax',
            'Halley Labs',
            'The Quick Brown Fox'
          ],
          start: m
            .clone()
            .add(637, 'seconds')
            .toISOString(),
          length: 192.89
        },
        {
          audio: '/public/mock/wonderland.mp3',
          artist: 'The Adventure Zone',
          members: [
            'Griffin McElroy',
            'Justin McElroy',
            'Travis McElroy',
            'Clint McElroy'
          ],
          start: m
            .clone()
            .add(860, 'seconds')
            .toISOString(),
          length: 156.92
        }
      ]
    };
  }
}

window.customElements.define('festival-load-sets', FestivalLoadSets);
