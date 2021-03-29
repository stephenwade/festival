export const store = {
  dispatch(action) {
    this._actions.push(action);
  },

  getState() {
    if (!this._showStatus) this.resetShowStatus(false);
    if (!this._audioStatus) this.resetAudioStatus(false);
    if (!this._settings) this.resetSettings(false);
    if (!this._ui) this.resetUi(false);

    return {
      showStatus: this._showStatus,
      audioStatus: this._audioStatus,
      settings: this._settings,
      ui: this._ui,
    };
  },

  subscribe(listener) {
    this._subscribers.push(listener);

    return () => {
      const index = this._subscribers.indexOf(listener);
      if (index > -1) {
        this._subscribers.splice(index, 1);
      }
    };
  },

  get actions() {
    return this._actions;
  },

  resetActions() {
    this._actions = [];
  },

  extendShowStatus(obj) {
    this._showStatus = { ...this._showStatus, ...obj };
    this._callSubscribers();
  },

  resetShowStatus(_callSubscribers = true) {
    this._showStatus = {
      status: 'WAITING_FOR_AUDIO_CONTEXT',
      set: { test: 'test' },
      secondsUntilSet: 40,
      currentTime: 95,
      delay: 15,
    };

    if (_callSubscribers) this._callSubscribers();
  },

  extendAudioStatus(obj) {
    this._audioStatus = { ...this._audioStatus, ...obj };
    this._callSubscribers();
  },

  resetAudioStatus(_callSubscribers = true) {
    this._audioStatus = {
      paused: false,
      stalled: false,
      waiting: false,
    };

    if (_callSubscribers) this._callSubscribers();
  },

  resetSettings(_callSubscribers = true) {
    this._settings = {
      volume: 35,
      lastUnmutedVolume: 55,
    };

    if (_callSubscribers) this._callSubscribers();
  },

  resetUi(_callSubscribers = true) {
    this._ui = {
      errorLoading: false,
    };

    if (_callSubscribers) this._callSubscribers();
  },

  _actions: [],

  _subscribers: [],

  _callSubscribers() {
    this._subscribers.forEach((listener) => {
      listener();
    });
  },
};
