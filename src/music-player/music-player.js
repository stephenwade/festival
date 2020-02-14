import { html, PolymerElement } from '@polymer/polymer/polymer-element.js';
import { afterNextRender } from '@polymer/polymer/lib/utils/render-status.js';
import '@polymer/polymer/lib/elements/dom-if.js';
import '@polymer/paper-spinner/paper-spinner-lite.js';
import { AudioContext } from 'standardized-audio-context';

export class MusicPlayer extends PolymerElement {
  constructor() {
    super();

    afterNextRender(this, () => {
      this._audioContext = new AudioContext();

      this._track = this._audioContext.createMediaElementSource(this.$.audio);

      this._analyserNode = this._audioContext.createAnalyser();
      this._analyserNode.fftSize = 1024;
      this._analyserNode.minDecibels = -85;
      this._analyserNode.smoothingTimeConstant = 0.7;
      this._analyzerData = new Uint8Array(this._analyserNode.frequencyBinCount);

      this._gainNode = this._audioContext.createGain();
      // this._gainNode.gain.value = 0.2;

      this._track
        .connect(this._analyserNode)
        .connect(this._gainNode)
        .connect(this._audioContext.destination);
    });
  }

  static get template() {
    return html`
      <style>
        :host {
          font-size: 40px;
        }

        canvas {
          width: 100%;
          height: 100%;
        }

        #timer,
        paper-spinner-lite {
          position: absolute;
          top: 50%;
          left: 50%;
          -webkit-transform: translate(-50%, -50%);
          transform: translate(-50%, -50%);
        }

        #timer {
          transition: opacity 1s ease-in;
        }

        #timer[hidden] {
          /*
            if you change the display property while changing other properties,
            nothing animates. to work around this and animate the opacity,
            keep display the same and animate visibility.
          */
          display: initial;
          visibility: hidden;
          transition: opacity 0.25s ease-in, visibility 0s 0.25s;

          opacity: 0;
        }

        paper-spinner-lite {
          width: 100px;
          height: 100px;
          --paper-spinner-color: #ffb74d; /* material orange 300 */
          --paper-spinner-stroke-width: 8px;
        }
      </style>
      <audio
        id="audio"
        on-waiting="_handleWaiting"
        on-playing="_handlePlaying"
        on-timeupdate="_handleTimeUpdate"
      ></audio>
      <canvas id="canvas" hidden$="[[!_playing]]"></canvas>
      <div id="timer" hidden$="[[_timerHidden]]">[[_currentTimeText]]</div>
      <paper-spinner-lite active="[[_audioWaiting]]"></paper-spinner-lite>
    `;
  }

  static get properties() {
    return {
      src: {
        type: String
      },
      _currentTime: {
        type: Number,
        value: 0
      },
      _currentTimeText: {
        type: String,
        computed: '_computeCurrentTimeText(_currentTime)'
      },
      _playing: {
        type: Boolean,
        value: false
      },
      _audioWaiting: {
        type: Boolean,
        value: false
      },
      _timerHidden: {
        type: Boolean,
        computed: '_computeTimerHidden(_playing, _audioWaiting)'
      }
    };
  }

  _computeCurrentTimeText(_currentTime) {
    const timeInSeconds = Math.trunc(_currentTime);
    const minutes = Math.trunc(timeInSeconds / 60);
    const seconds = timeInSeconds % 60;
    return String(minutes) + ':' + String(seconds).padStart(2, '0');
  }

  _computeTimerHidden(_playing, _audioWaiting) {
    if (_playing) return _audioWaiting;
    return true;
  }

  resumeAudioContext() {
    // Safari will only resume the AudioContext on a click event
    this._audioContext.resume();
  }

  queue() {
    this.$.audio.src = this.src;
  }

  play(startTime) {
    if (startTime && startTime > 0.5) {
      this._audioWaiting = true;
      this.$.audio.currentTime = startTime + 1;
      setTimeout(() => {
        this._audioWaiting = false;
        this.$.audio.play();
      }, 1000);
    } else {
      this.$.audio.play();
    }

    this._playing = true;
    this._animate();
  }

  _handleWaiting() {
    this._waitingTimeout = setTimeout(() => {
      this._audioWaiting = true;
    }, 500);
  }

  _handlePlaying() {
    clearTimeout(this._waitingTimeout);
    this._audioWaiting = false;
  }

  _handleTimeUpdate(e) {
    this._currentTime = e.target.currentTime;
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
    options
  ) {
    let distanceAroundCircle = (i - options.start) / (dist - options.start);
    distanceAroundCircle = (1 - distanceAroundCircle) ** 1.5;
    distanceAroundCircle = Math.PI + 2 * distanceAroundCircle * Math.PI;

    return [
      midX +
        Math.sin(distanceAroundCircle) *
          (this._analyzerData[i + 10] * mult * scaleFactor + constScaleAdd) *
          (grow + 1.5),
      midY +
        Math.cos(distanceAroundCircle) *
          (this._analyzerData[i + 10] * mult * scaleFactor + constScaleAdd) *
          (grow + 1.5)
    ];
  }

  _drawCircle(canvas, ctx, options = {}) {
    const defaultOptions = {
      start: 0,
      end: this._analyzerData.length * 0.63,
      color: '#ffffff',
      thatOneValue: 0.35
    };

    const options_ = { ...defaultOptions, ...options };

    const midX = canvas.width / 2;
    const midY = canvas.height / 2;

    // circle
    ctx.beginPath();
    ctx.strokeStyle = options_.color;
    ctx.fillStyle = options_.color;
    const dist = options_.end;
    const grow =
      (this._analyzerData[0] +
        this._analyzerData[1] +
        this._analyzerData[2] +
        this._analyzerData[3] +
        this._analyzerData[4]) *
      0.001;
    let [x, y] = this._getCirclePoint(
      options_.start,
      midX,
      midY,
      dist,
      grow,
      options_.thatOneValue,
      options_.scaleFactor,
      options_.scaleConstAdd,
      options_
    );
    let [xNext, yNext] = this._getCirclePoint(
      options_.start + 1,
      midX,
      midY,
      dist,
      grow,
      options_.thatOneValue,
      options_.scaleFactor,
      options_.scaleConstAdd,
      options_
    );
    for (let i = options_.start + 1; i < dist + 1; i++) {
      const mult = (i / (dist + options_.start)) * 0.4 + 0.2;
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
        options_.scaleFactor,
        options_.scaleConstAdd,
        options_
      );
    }
    ctx.fill();
    // ctx.moveTo(0, 0)
    ctx.beginPath();
    ctx.save();
    ctx.arc(midX, midY, 90 * grow + 106, 0, 2 * Math.PI);
    ctx.clip();
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.restore();
  }

  _animate() {
    const { canvas } = this.$;
    if (!canvas) {
      requestAnimationFrame(this._animate.bind(this));
      return;
    }

    if (canvas.width !== window.innerWidth) canvas.width = window.innerWidth;
    if (canvas.height !== window.innerHeight)
      canvas.height = window.innerHeight;

    this._analyserNode.getByteFrequencyData(this._analyzerData);

    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    this._drawCircle(canvas, ctx, {
      start: 0,
      end: 100,
      color: '#6b33fa',
      scaleFactor: 0.3,
      scaleConstAdd: 70,
      thatOneValue: 0.2
    });
    this._drawCircle(canvas, ctx, {
      start: 150,
      end: this._analyzerData.length * 0.63,
      color: '#fb3363',
      scaleFactor: 0.8,
      scaleConstAdd: 50,
      thatOneValue: 0.35
    });

    requestAnimationFrame(this._animate.bind(this));
  }
}

window.customElements.define('music-player', MusicPlayer);
