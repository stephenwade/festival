// In production, BUILD_ENV is set to 'production'
// This is accomplished by @rollup/plugin-replace in rollup.config.js
const BUILD_ENV = '__buildEnv__';

// In development, serve media from ./media
// In production, serve media from Azure
const audioPrefix =
  BUILD_ENV === 'production'
    ? 'https://sndfli.z13.web.core.windows.net/'
    : 'media/';

export class FestivalLoadSets extends HTMLElement {
  async loadData() {
    const response = await window.fetch('media/sets.json');

    if (!response.ok)
      throw new Error(`Response: ${response.status} ${response.statusText}`);

    const data = await response.json();

    data.sets.forEach((set) => {
      if (set.audio) set.audio = audioPrefix + set.audio;
    });

    return data;
  }
}

window.customElements.define('festival-load-sets', FestivalLoadSets);
