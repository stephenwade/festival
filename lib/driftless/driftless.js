/* eslint-disable */

// driftless and present copied to this project to avoid import issues

// present version 1.0.0

const present = (function() {
  var names = ['now', 'webkitNow', 'msNow', 'mozNow', 'oNow'];
  while (names.length) {
    var name = names.shift();
    if (name in performance) {
      return performance[name].bind(performance);
    }
  }

  var dateNow =
    Date.now ||
    function() {
      return +new Date();
    };
  var navigationStart = (performance.timing || {}).navigationStart || dateNow();
  return function() {
    return dateNow() - navigationStart;
  };
})();

// driftless version 2.0.3

export const DEFAULT_THRESHOLD_MS = 1;
export const DEFAULT_AGGRESSION = 1.1;
export const DEFAULT_NOW_FN = (...args) => present(...args);
export const DEFAULT_SET_TIMEOUT = (...args) => setTimeout(...args);
export const DEFAULT_CLEAR_TIMEOUT = (...args) => clearTimeout(...args);

const timerHandles = {};
let nextId = 0;

function tryDriftless(id, opts) {
  const {
    atMs,
    fn,
    thresholdMs = DEFAULT_THRESHOLD_MS,
    aggression = DEFAULT_AGGRESSION,
    customNow = DEFAULT_NOW_FN,
    customSetTimeout = DEFAULT_SET_TIMEOUT
  } = opts;
  const delayMs = atMs - customNow();

  const handle =
    delayMs > thresholdMs
      ? customSetTimeout(() => {
          tryDriftless.apply(this, arguments); // eslint-disable-line prefer-rest-params
        }, delayMs / aggression)
      : customSetTimeout(() => {
          // Call the function using setTimeout to ensure asynchrony
          fn();
        }, 0);

  timerHandles[id] = handle;
}

export function setDriftless(...args) {
  return setDriftless.setDriftlessSpyable(...args);
}

// Separate function for testing
setDriftless.setDriftlessSpyable = opts => {
  const id = nextId;
  nextId += 1;
  tryDriftless(id, opts);
  return id;
};

export function clearDriftless(id, opts = {}) {
  const { customClearTimeout = DEFAULT_CLEAR_TIMEOUT } = opts;
  customClearTimeout(timerHandles[id]);
}

function castToFn(fn) {
  return typeof fn === 'function' ? fn : new Function(fn); // eslint-disable-line no-new-func
}

export function setDriftlessTimeout(fn, delayMs, ...params) {
  const callFn = castToFn(fn);
  return setDriftless({
    atMs: DEFAULT_NOW_FN() + delayMs,
    fn(...args) {
      return callFn.call(this, ...args, ...params);
    }
  });
}

export function setDriftlessInterval(fn, delayMs, ...params) {
  const callFn = castToFn(fn);
  let id;
  const opts = {
    atMs: DEFAULT_NOW_FN() + delayMs,
    fn(...args) {
      opts.atMs += delayMs;
      tryDriftless(id, opts);
      return callFn.call(this, ...args, ...params);
    }
  };
  id = setDriftless(opts);
  return id;
}
