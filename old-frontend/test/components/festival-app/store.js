export const store = {
  dispatch(action) {
    this._actions.push(action);
  },

  getState() {
    return {
      audioStatus: {
        waiting: false,
      },
      clock: {
        ticking: false,
      },
      showStatus: {
        status: 'WAITING_FOR_AUDIO_CONTEXT',
      },
      targetShowStatus: {
        status: 'WAITING_UNTIL_START',
      },
      ui: {
        errorLoading: false,
      },
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

  lastAction() {
    if (this._actions.length) {
      return this._actions[this._actions.length - 1];
    }
    return undefined;
  },

  resetActions() {
    this._actions = [];
  },

  _actions: [],

  _subscribers: [],

  _callSubscribers() {
    this._subscribers.forEach((listener) => {
      listener();
    });
  },
};
