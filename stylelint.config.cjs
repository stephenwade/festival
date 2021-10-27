// eslint-disable-next-line import/no-extraneous-dependencies
const postcssCssInJs = require('@stylelint/postcss-css-in-js')();
// ^^ requires postcss-syntax to be installed

module.exports = {
  extends: [
    'stylelint-config-standard',
    'stylelint-config-prettier',
    'stylelint-config-hudochenkov/order',
  ],
  rules: {
    'selector-type-no-unknown': [true, { ignore: ['custom-elements'] }],

    // disabled because it forbids the :host selector
    'selector-pseudo-element-colon-notation': null,

    'declaration-block-trailing-semicolon': 'always',
  },
  customSyntax: postcssCssInJs,
};
