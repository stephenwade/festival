import { LitElement, html, css } from 'lit-element';

import './fab-volume-button.js';
import './loading-spinner.js';
import {
  boxSizingBorderBox,
  flexColumnCenter,
  fullPageClass,
} from './shared-styles.js';

export class FestivalUiPlaying extends LitElement {
  static get styles() {
    return [
      boxSizingBorderBox,
      flexColumnCenter,
      fullPageClass,
      css`
        :host {
          overflow: hidden; /* <fab-volume-button> causes overflow */
          padding: 0 1em;
          color: #0a1b27;
        }

        #current-time,
        #artist {
          z-index: 1;
        }

        #current-time {
          margin-bottom: 0.2em;
          font-weight: 900;
          font-size: 5em;
        }

        #next-up {
          margin-bottom: 0.2em;
          font-size: 2em;
          text-transform: uppercase;
        }

        #artist {
          max-width: calc(min(60vh, 10em));
          margin-bottom: -0.1em;
          font-weight: 900;
          font-size: 3em;
          line-height: 0.9;
          letter-spacing: -0.05em;
          text-align: center;
          text-transform: uppercase;
          user-select: text;
        }

        #volume-button {
          position: absolute;
          right: 1.5em;
          bottom: 1.5em;
        }
      `,
    ];
  }

  render() {
    return html`
      <canvas id="canvas" class="full-page"></canvas>
      <div id="current-time">
        ${this._showSpinner()
          ? html`<loading-spinner></loading-spinner>`
          : html`${this._computeCurrentTimeText()}`}
      </div>
      <div id="next-up" ?hidden=${!this.waitingUntilStart}>Next up</div>
      <div id="artist">
        ${
          /* avoid console errors if `this.set` is undefined */
          this.set && this.set.artist
        }
      </div>
      <fab-volume-button
        id="volume-button"
        .volume="${this.volume}"
        @volumeinput="${this._handleVolumeInput}"
      ></fab-volume-button>
    `;
  }

  static get properties() {
    return {
      set: { type: Object },
      waitingUntilStart: { type: Boolean },
      secondsUntilSet: { type: Number },
      waitingForNetwork: { type: Boolean },
      currentTime: { type: Number },
      audioPaused: { type: Boolean },
      reduceMotion: { type: Boolean },
      volume: { type: Number, reflect: true },
    };
  }

  shouldUpdate(changedProps) {
    if (changedProps.has('set')) this._showProgressLine = false;
    if (changedProps.has('waitingUntilStart')) {
      if (!this.waitingUntilStart) this._animate();
    }

    if (
      changedProps.has('waitingForNetwork') ||
      changedProps.has('audioPaused') ||
      changedProps.has('currentTime')
    ) {
      this._updateTimestamp();
    }

    return true;
  }

  firstUpdated() {
    // set up resize handler
    const resizeCanvas = () => {
      const canvas = this.shadowRoot.getElementById('canvas');
      const scale = window.devicePixelRatio;

      canvas.width = window.innerWidth * scale;
      canvas.height = window.innerHeight * scale;

      this._sizeMultiplier =
        window.devicePixelRatio *
        Math.min(1, window.innerWidth / 500, window.innerHeight / 800);

      // canvas properties must be reset after canvas is resized
      const ctx = canvas.getContext('2d');

      ctx.lineWidth = 4 * this._sizeMultiplier;
      const color = '#0a1b27';
      ctx.strokeStyle = color;
      ctx.fillStyle = color;
    };

    this._resize = () => {
      resizeCanvas();
    };

    window.addEventListener('resize', this._resize);

    this._resize();

    // start draw loop
    this._animate();
  }

  constructor() {
    super();

    this._closeVolumeButton = this._closeVolumeButton.bind(this);
  }

  connectedCallback() {
    super.connectedCallback();

    this.shadowRoot.addEventListener('click', this._closeVolumeButton);
  }

  disconnectedCallback() {
    window.removeEventListener('resize', this._resize);
    this.shadowRoot.removeEventListener('click', this._closeVolumeButton);

    super.disconnectedCallback();
  }

  _handleVolumeInput(e) {
    this.volume = e.detail.volume;
  }

  _closeVolumeButton(e) {
    const button = this.shadowRoot.getElementById('volume-button');
    if (e.target !== button) button.close();
  }

  _updateTimestamp() {
    this._lastUpdateTimestamp = performance.now();
  }

  _showSpinner() {
    if (this.waitingUntilStart) return false;
    return this.waitingForNetwork;
  }

  _computeCurrentTimeText() {
    let time;
    if (this.waitingUntilStart) {
      time = this.secondsUntilSet;
    } else {
      time = Math.floor(this.currentTime + 0.1);
    }

    const hours = Math.floor(time / (60 * 60));
    const minutesFrac = time % (60 * 60);

    const minutes = Math.floor(minutesFrac / 60);
    const seconds = time % 60;

    let result = '';
    if (hours > 0) {
      result += `${hours.toString()}:${minutes.toString().padStart(2, '0')}`;
    } else {
      result += minutes.toString();
    }
    result += `:${seconds.toString().padStart(2, '0')}`;
    return result;
  }

  _calcGrow(dataArray) {
    if (this.reduceMotion) return 0;

    const average = dataArray.slice(0, 5).reduce((a, b) => a + b) / 5;
    return average / 255;
  }

  _getCirclePoint(i, end, dataArray) {
    const canvas = this.shadowRoot.getElementById('canvas');
    const midX = canvas.width / 2;
    const midY = canvas.height / 2;

    const grow = this._calcGrow(dataArray);
    const loudness = dataArray[i + 10];

    const p1 = 0.1275;
    const p2 = 2;
    const p3 = 0.168;
    const p4 = 0.18;
    const p5 = 120;

    const distanceFromCenter =
      (grow * p1 + p2) *
      (loudness * ((i / end) * p3 + p4) + p5) *
      this._sizeMultiplier;

    const angleAroundCircle = 2 * Math.PI * (0.5 + (1 - i / end) ** 1.5);

    const x = midX + Math.sin(angleAroundCircle) * distanceFromCenter;
    const y = midY + Math.cos(angleAroundCircle) * distanceFromCenter;

    return [x, y];
  }

  _drawCircle(dataArray) {
    const canvas = this.shadowRoot.getElementById('canvas');
    const ctx = canvas.getContext('2d');

    const midX = canvas.width / 2;
    const midY = canvas.height / 2;

    // draw waves
    ctx.beginPath();
    const end = dataArray.length * 0.43;
    const grow = this._calcGrow(dataArray);
    let [x, y] = this._getCirclePoint(0, end, dataArray);
    let [xNext, yNext] = this._getCirclePoint(1, end, dataArray);
    for (let i = 1; i < end + 1; i += 1) {
      if (i === 0) {
        ctx.moveTo(x, y);
      } else {
        const xc = (x + xNext) / 2;
        const yc = (y + yNext) / 2;
        ctx.quadraticCurveTo(x, y, xc, yc);
      }
      [x, y] = [xNext, yNext];
      [xNext, yNext] = this._getCirclePoint(i + 1, end, dataArray);
    }
    ctx.fill();

    // clear center of circle
    ctx.save();
    ctx.beginPath();

    const p1 = 22.95;
    const p2 = 290;

    const radius = (grow * p1 + p2) * this._sizeMultiplier;

    ctx.arc(midX, midY, radius, 0, 2 * Math.PI);

    ctx.clip();
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.restore();
  }

  _drawProgress(dataArray, progress) {
    const canvas = this.shadowRoot.getElementById('canvas');
    const ctx = canvas.getContext('2d');

    const midX = canvas.width / 2;
    const midY = canvas.height / 2;

    const grow = this._calcGrow(dataArray);

    const p1 = 12.75;
    const p2 = 280;

    const distance = (grow * p1 + p2) * this._sizeMultiplier;

    const angleStart = Math.PI * -0.5;
    const progressAngle = 2 * Math.PI * progress;

    // progress line
    ctx.beginPath();
    ctx.arc(midX, midY, distance, angleStart, angleStart + progressAngle);
    ctx.stroke();

    const dotRadius = 7 * this._sizeMultiplier;

    // start dot
    ctx.beginPath();
    ctx.arc(midX, midY - distance, dotRadius, 0, 2 * Math.PI);
    ctx.fill();

    // end dot
    ctx.beginPath();
    ctx.arc(
      midX + Math.sin(progressAngle) * distance,
      midY - Math.cos(progressAngle) * distance,
      dotRadius,
      0,
      2 * Math.PI
    );
    ctx.fill();
  }

  _animate() {
    const canvas = this.shadowRoot.getElementById('canvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    if (this.waitingUntilStart) return;

    if (this.getAudioVisualizerData) {
      if (!this.delaying) {
        const dataArray = this.getAudioVisualizerData();

        if (!this.reduceMotion) this._drawCircle(dataArray);

        this._updateShowProgressLine();

        if (this._showProgressLine) {
          const progress = this._calcProgressPercentage();
          this._drawProgress(dataArray, progress);
        }
      }
    }

    window.requestAnimationFrame(this._animate.bind(this));
  }

  _updateShowProgressLine() {
    if (!this._showProgressLine)
      if (!this.waitingUntilStart && !this.waitingForNetwork)
        this._showProgressLine = true;
  }

  _calcProgressPercentage() {
    let currentTime;
    if (this.waitingForNetwork || this.audioPaused) {
      currentTime = this.currentTime;
    } else {
      const delayMs = performance.now() - this._lastUpdateTimestamp;
      currentTime = this.currentTime + delayMs / 1000;
    }
    const result = currentTime / this.set.length;
    if (result > 1) return 1;
    return result;
  }
}

window.customElements.define('festival-ui-playing', FestivalUiPlaying);
