export const store = {
  dispatch(action) {
    this._actions.push(action);
  },

  getState() {
    return {};
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

  _actions: [],

  _subscribers: [],

  _callSubscribers() {
    this._subscribers.forEach((listener) => {
      listener();
    });
  },
};
