export default {
  extends: ["stylelint-config-standard-scss"],
  plugins: ["stylelint-order"],
  rules: {
    "order/properties-alphabetical-order": true,
    "color-no-hex": true,
    "declaration-no-important": true,
    "selector-max-id": 0,
    "max-nesting-depth": 2,
    "at-rule-no-unknown": [
      true,
      {
        ignoreAtRules: ["theme", "import", "custom-variant", "apply", "tailwind", "config", "source"],
      },
    ],
  },
};
