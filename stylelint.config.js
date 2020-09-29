module.exports = {
  extends: ['stylelint-config-standard', 'stylelint-config-prettier'],
  rules: {
    // https://github.com/necolas/idiomatic-css#declaration-order
    'declaration-empty-line-before': null,

    'selector-type-no-unknown': [true, { ignore: ['custom-elements'] }],

    // disabled because it forbids the :host selector
    'selector-pseudo-element-colon-notation': null,
  },
};
