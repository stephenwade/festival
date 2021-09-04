import { LitElement, html, css } from 'lit';
import { ref, createRef } from 'lit/directives/ref.js';
import { Router } from '@vaadin/router';

import './festival-ui-intro-page.js';
import './festival-ui-live-page.js';
import { boxSizingBorderBox, fullPageClass } from './shared-styles.js';

class FestivalUi extends LitElement {
  static get styles() {
    return [
      boxSizingBorderBox,
      fullPageClass,
      css`
        :host {
          font-family: 'HelveticaNeue-Light', 'Helvetica Neue Light',
            'Helvetica Neue', Helvetica, Arial, 'Lucida Grande', sans-serif;
          user-select: none;
        }
      `,
    ];
  }

  render() {
    return html`<div class="full-page" ${ref(this._outlet)}></div>`;
  }

  constructor() {
    super();

    this._router = new Router();

    const liveWithVisualizer = (context, commands) => {
      if (this.getAudioVisualizerData) {
        context.params.getAudioVisualizerData = this.getAudioVisualizerData;
      }

      return commands.component('festival-ui-live-page');
    };

    this._router.setRoutes([
      { path: '/', redirect: '/cubed' },
      { path: '/cubed/', redirect: '/cubed' },
      { path: '/cubed', component: 'festival-ui-intro-page' },
      { path: '/cubed/live/', redirect: '/cubed/live' },
      { path: '/cubed/live', action: liveWithVisualizer },
      { path: '(.*)', redirect: '/cubed' },
    ]);

    this._outlet = createRef();
  }

  firstUpdated() {
    this._router.setOutlet(this._outlet.value);
  }

  showAudioError() {
    const live = this.shadowRoot.querySelector('festival-ui-live-page');
    if (live) {
      live.showAudioError();
    }
  }
}

customElements.define('festival-ui', FestivalUi);
