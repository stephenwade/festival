module.exports = {
  extends: ['stylelint-config-standard', 'stylelint-config-hudochenkov/order'],
  rules: {
    'selector-type-no-unknown': [true, { ignore: ['custom-elements'] }],

    // disabled because it forbids the :host selector
    'selector-pseudo-element-colon-notation': null,

    'declaration-property-value-no-unknown': true,
  },
  overrides: [
    {
      files: ['**/*.js'],
      customSyntax: 'postcss-lit',
    },
    {
      files: ['**/*.html'],
      customSyntax: 'postcss-html',
    },
  ],
};
