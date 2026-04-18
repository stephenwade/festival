/** @type {import('stylelint').Config} */
export default {
  extends: ['stylelint-config-standard', 'stylelint-config-hudochenkov/order'],
  rules: {
    'declaration-property-value-no-unknown': true,
  },
};
