module.exports = {
  extends: [
    'stylelint-config-standard',
    'stylelint-config-prettier',
    'stylelint-config-hudochenkov/order',
  ],
  rules: {
    'declaration-block-trailing-semicolon': 'always',
  },
};
