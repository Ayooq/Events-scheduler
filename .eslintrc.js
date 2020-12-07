module.exports = {
  root: true,
  env: {
    browser: true,
    node: true,
    es2020: true,
  },
  extends: [
    "eslint:recommended",
    "plugin:vue/recommended",
    "prettier",
    "prettier/vue",
  ],
  parser: "vue-eslint-parser",
  parserOptions: {
    parser: "babel-eslint",
    sourceType: "module",
  },
  rules: {
    "no-console": process.env.NODE_ENV === "production" ? "warn" : "off",
    "no-debugger": process.env.NODE_ENV === "production" ? "warn" : "off",
    "no-confusing-arrow": "error",
    "no-extra-parens": ["error", "functions"],
    "no-mixed-operators": "error",
    "operator-linebreak": ["error", "before"],
  },
};
