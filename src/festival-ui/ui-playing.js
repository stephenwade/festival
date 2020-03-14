import { html, PolymerElement } from '@polymer/polymer/polymer-element.js';
import '@polymer/polymer/lib/elements/dom-if.js';
import '@polymer/polymer/lib/elements/dom-repeat.js';
import '@polymer/paper-spinner/paper-spinner-lite.js';

export class UiPlaying extends PolymerElement {
  static get template() {
    return html`
      <style>
        :host {
          box-sizing: border-box;
        }
        *,
        *:before,
        *:after {
          box-sizing: inherit;
        }

        :host {
          color: white;
          width: 100%;
          height: 100%;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          text-align: center;
          padding: 0 1em;
          text-transform: uppercase;
        }

        canvas {
          position: absolute;
          width: 100%;
          height: 100%;
        }

        #current-time,
        #artist-group-outer {
          z-index: 1;
        }

        #current-time {
          height: 6rem;
          font-size: 5em;
          font-weight: 900;
          margin-bottom: 0.2em;
        }

        paper-spinner-lite {
          --paper-spinner-stroke-width: 3px;
          --paper-spinner-color: white;
          width: 4em;
          height: 4em;
          font-size: initial;
        }

        #artist-group-outer {
          width: 100vw;
        }

        #artist-group {
          display: inline-block;
        }

        #artist-group.vertical {
          max-width: 100vw;
          padding: 0 1em;
        }

        #artist-group.vertical div {
          display: block;
          padding-left: 0;
          text-align: left;
        }

        #artist,
        #members {
          display: inline-block;
          vertical-align: top;
        }

        #artist {
          font-size: 3em;
          font-weight: 900;
          text-align: right;
          line-height: 0.9;
          letter-spacing: -0.05em;
          margin-bottom: -0.2rem;
        }

        #members {
          font-size: 1.3em;
          text-align: left;
          line-height: 1;
          padding-left: 0.6rem;
          padding-top: 0.25rem;
        }

        #members span {
          display: block;
        }
      </style>
      <canvas id="canvas"></canvas>
      <div id="current-time">
        <template is="dom-if" if="[[delaying]]">
          <paper-spinner-lite active></paper-spinner-lite>
        </template>
        <template is="dom-if" if="[[!delaying]]">
          [[_currentTimeText]]
        </template>
      </div>
      <div id="artist-group-outer">
        <div id="artist-group">
          <div id="artist">[[set.artist]]</div>
          <div id="members">
            <dom-repeat items="[[set.members]]" on-dom-change="_resizeText">
              <template>
                <span>[[item]]</span>
              </template>
            </dom-repeat>
          </div>
        </div>
      </div>
    `;
  }

  static get properties() {
    return {
      set: Object,
      delaying: Boolean,
      currentTime: Number,
      getAudioVisualizerData: Function,
      _currentTimeText: {
        type: String,
        computed: '_computeCurrentTimeText(currentTime)'
      },
      _setProgressPercentage: {
        type: Number,
        computed: '_computeSetProgressPercentage(currentTime, set.length)'
      }
    };
  }

  connectedCallback() {
    super.connectedCallback();

    const resizeCanvas = () => {
      const canvas = this.$.canvas;
      const scale = window.devicePixelRatio;

      canvas.width = window.innerWidth * scale;
      canvas.height = window.innerHeight * scale;
    };

    this._resize = () => {
      resizeCanvas();
      this._resizeText();
    };

    window.addEventListener('resize', this._resize);

    resizeCanvas();

    this._animate();
  }

  disconnectedCallback() {
    super.disconnectedCallback();

    window.removeEventListener('resize', this._resize);
  }

  _resizeText() {
    const artistGroup = this.$['artist-group'];

    artistGroup.classList.remove('vertical');
    const rect = artistGroup.getBoundingClientRect();
    const maxWidth = Math.min(500, window.innerWidth);
    if (rect.width >= maxWidth) artistGroup.classList.add('vertical');
  }

  _computeCurrentTimeText(currentTime) {
    const currentTimeAdjusted = Math.floor(currentTime + 0.1);
    const minutes = Math.floor(currentTimeAdjusted / 60);
    const seconds = currentTimeAdjusted % 60;
    return minutes.toString() + ':' + seconds.toString().padStart(2, '0');
  }

  _computeSetProgressPercentage(currentTime, length) {
    return currentTime / length;
  }

  _getCirclePoint(
    i,
    midX,
    midY,
    dist,
    grow,
    mult,
    scaleFactor,
    constScaleAdd,
    options,
    dataArray
  ) {
    let distanceAroundCircle = (i - options.start) / (dist - options.start);
    distanceAroundCircle = Math.pow(1 - distanceAroundCircle, 1.5);
    distanceAroundCircle = Math.PI + 2 * distanceAroundCircle * Math.PI;

    return [
      midX +
        Math.sin(distanceAroundCircle) *
          (dataArray[i + 10] *
            mult *
            scaleFactor *
            options.sizeMultipler *
            0.5 +
            constScaleAdd * options.sizeMultipler) *
          (grow + 1.5),
      midY +
        Math.cos(distanceAroundCircle) *
          (dataArray[i + 10] *
            mult *
            scaleFactor *
            options.sizeMultipler *
            0.5 +
            constScaleAdd * options.sizeMultipler) *
          (grow + 1.5)
    ];
  }

  _calcGrow(dataArray) {
    return (
      (dataArray[0] +
        dataArray[1] +
        dataArray[2] +
        dataArray[3] +
        dataArray[4]) *
        0.0001 +
      0.5
    );
  }

  _drawCircle(canvas, ctx, dataArray, options = {}) {
    const defaultOptions = {
      start: 0,
      end: dataArray.length * 0.63,
      color: '#ffffff',
      thatOneValue: 0.35
    };

    const opts = { ...defaultOptions, ...options };

    const midX = canvas.width / 2;
    const midY = canvas.height / 2;

    // circle
    ctx.beginPath();
    ctx.strokeStyle = opts.color;
    ctx.fillStyle = opts.color;
    const dist = opts.end;
    const grow = this._calcGrow(dataArray);
    let [x, y] = this._getCirclePoint(
      opts.start,
      midX,
      midY,
      dist,
      grow,
      opts.thatOneValue,
      opts.scaleFactor,
      opts.scaleConstAdd,
      opts,
      dataArray
    );
    let [xNext, yNext] = this._getCirclePoint(
      opts.start + 1,
      midX,
      midY,
      dist,
      grow,
      opts.thatOneValue,
      opts.scaleFactor,
      opts.scaleConstAdd,
      opts,
      dataArray
    );
    for (let i = opts.start + 1; i < dist + 1; i++) {
      const mult = (i / (dist + opts.start)) * 0.56 + 0.6;
      // const mult = 1;
      if (i === 0) {
        ctx.moveTo(x, y);
      } else {
        const xc = (x + xNext) / 2;
        const yc = (y + yNext) / 2;
        ctx.quadraticCurveTo(x, y, xc, yc);
        // ctx.lineTo(x, y);
      }
      [x, y] = [xNext, yNext];
      [xNext, yNext] = this._getCirclePoint(
        i + 1,
        midX,
        midY,
        dist,
        grow,
        mult,
        opts.scaleFactor,
        opts.scaleConstAdd,
        opts,
        dataArray
      );
    }
    ctx.fill();
    // ctx.moveTo(0, 0)
    ctx.beginPath();
    ctx.save();
    ctx.arc(midX, midY, (90 * grow + 100) * opts.sizeMultipler, 0, 2 * Math.PI);
    ctx.clip();
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.restore();
  }

  _drawProgress(canvas, ctx, dataArray, options = {}) {
    const midX = canvas.width / 2;
    const midY = canvas.height / 2;

    const grow = this._calcGrow(dataArray);
    // const grow = 0.7;

    const angleStart = -Math.PI * 0.5;
    const distance = (50 * grow + 115) * options.sizeMultipler;

    const progressAngle = Math.PI * 2 * options.progress;

    ctx.beginPath();
    ctx.lineWidth = 2 * options.sizeMultipler;
    ctx.arc(midX, midY, distance, angleStart, angleStart + progressAngle);
    ctx.stroke();

    ctx.beginPath();
    ctx.arc(midX, midY - distance, 3.5 * options.sizeMultipler, 0, 2 * Math.PI);
    ctx.fill();

    ctx.beginPath();
    ctx.arc(
      midX + Math.sin(progressAngle) * distance,
      midY - Math.cos(progressAngle) * distance,
      3.5 * options.sizeMultipler,
      0,
      2 * Math.PI
    );
    ctx.fill();
  }

  _animate() {
    const canvas = this.$.canvas;
    const ctx = canvas.getContext('2d');

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    let mult = Math.min(window.innerWidth / 500, window.innerHeight / 800);
    mult = Math.min(1, mult);

    if (this.getAudioVisualizerData) {
      if (!this.delaying) {
        const dataArray = this.getAudioVisualizerData();

        this._drawCircle(canvas, ctx, dataArray, {
          start: 0,
          end: dataArray.length * 0.43,
          color: '#ffffff',
          scaleFactor: 0.3,
          // scaleFactor: 0.1,
          scaleConstAdd: 60,
          thatOneValue: 0.6,
          sizeMultipler: 2 * window.devicePixelRatio * mult
        });

        this._drawProgress(canvas, ctx, dataArray, {
          progress: this._setProgressPercentage,
          sizeMultipler: 2 * window.devicePixelRatio * mult
        });
      }

      window.requestAnimationFrame(this._animate.bind(this));
    }
  }
}

window.customElements.define('ui-playing', UiPlaying);
