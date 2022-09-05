export const store = {
  dispatch(action) {
    if (action === 'tick') {
      this._ticks += 1;
    }
  },

  getState() {
    return {
      clock: {
        ticking: this._ticking,
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

  startTicking() {
    this._ticking = true;
    this._callSubscribers();
  },

  stopTicking() {
    this._ticking = false;
    this._callSubscribers();
  },

  get ticks() {
    return this._ticks;
  },

  resetTicks() {
    this._ticks = 0;
  },

  _subscribers: [],

  _callSubscribers() {
    this._subscribers.forEach((listener) => {
      listener();
    });
  },

  _ticking: false,

  _ticks: 0,
};
