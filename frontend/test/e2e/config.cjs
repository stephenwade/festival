const { folio } = require('@playwright/test');

folio.config = {
  timeout: 15 * 1000,
};

module.exports.test = folio.test;
