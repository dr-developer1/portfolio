export default {
  extends: ['stylelint-config-standard'],
  rules: {
    'at-rule-no-unknown': [
      true,
      {
        ignoreAtRules: ['tailwind', 'apply', 'variants', 'responsive', 'screen'],
      },
    ],
    'import-notation': 'string',
    // Allow both camelCase (CSS Modules) and kebab-case (global CSS)
    'selector-class-pattern': [
      '^[a-z][a-zA-Z0-9]*$|^[a-z][a-z0-9]*(-[a-z0-9]+)*$',
      {
        message: 'Expected class selector to be camelCase or kebab-case',
      },
    ],
  },
};
