const config = {
  extends: ["stylelint-config-standard-scss"],
  plugins: ["stylelint-order"],
  rules: {
    "order/properties-alphabetical-order": true,
    // token 文件按类别分组留空行，机器强制"自定义属性前不得空行"与分组可读性冲突
    "custom-property-empty-line-before": null,
    "scss/at-rule-no-unknown": [
      true,
      {
        ignoreAtRules: [
          "theme",
          "import",
          "custom-variant",
          "apply",
          "tailwind",
          "config",
          "source",
        ],
      },
    ],
    // 颜色一律走 token；原语层的 hex 由现场注解的局部 disable 豁免
    "color-no-hex": true,
    "function-disallowed-list": ["rgb", "rgba", "hsl"],
    "declaration-no-important": true,
    "selector-max-id": 0,
    "max-nesting-depth": 2,
    "unit-allowed-list": ["px", "rem", "%", "em", "ms", "s", "deg", "fr", "vh", "vw"],
    // 不启用 custom-property-pattern：本项目语义 token 名为 bg/surface/text-muted 等
    // 短语义名（设计文档 §3），强制 color|space|... 前缀会与 Tailwind 语义类脱节。
    "at-rule-no-unknown": [
      true,
      {
        ignoreAtRules: [
          "theme",
          "import",
          "custom-variant",
          "apply",
          "tailwind",
          "config",
          "source",
        ],
      },
    ],
  },
};

export default config;
