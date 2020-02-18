import { html, PolymerElement } from '@polymer/polymer/polymer-element.js';
import { ActionMixin } from '../../lib/mixins/action-mixin.js';

export class FestivalAudio extends ActionMixin(PolymerElement) {
  static get template() {
    return html`
      <audio id="audio"></audio>
    `;
  }

  // This must be called from a click event because of Safari
  setupAudioContext() {
    this.audioContext = new AudioContext();

    const track = this.audioContext.createMediaElementSource(this.$.audio);

    const analyserNode = this.audioContext.createAnalyser();
    analyserNode.fftSize = 1024;
    analyserNode.minDecibels = -85;
    analyserNode.smoothingTimeConstant = 0.7;

    const audioVisualizerData = new Uint8Array(analyserNode.frequencyBinCount);

    // const gainNode = this.audioContext.createGain();
    // gainNode.gain.value = 0.2;

    track
      .connect(analyserNode)
      // .connect(gainNode)
      .connect(this.audioContext.destination);

    this.audioContext.resume().then(() => {
      this.fireAction('AUDIO_CONTEXT_READY', { audioVisualizerData });
    });
  }
}

window.customElements.define('festival-audio', FestivalAudio);
