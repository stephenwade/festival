// localStorage test from Modernizr 3.6.0, available under the MIT License
// https://modernizr.com/download?localstorage-dontmin

export default () => {
  const mod = 'modernizr';
  try {
    localStorage.setItem(mod, mod);
    localStorage.removeItem(mod);
    return true;
  } catch (e) {
    return false;
  }
};
