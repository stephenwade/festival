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
  },
};
