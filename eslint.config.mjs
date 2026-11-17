import js from "@eslint/js";
import tseslint from "typescript-eslint";

export default [
  {
    ignores: [
      ".next/**",
      "artifacts/**",
      "coverage/**",
      "node_modules/**",
      "shopify-theme/**",
      "theme/**"
    ]
  },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    files: ["app/**/*.ts", "app/**/*.tsx", "src/**/*.ts", "tests/**/*.ts"],
    languageOptions: {
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname
      },
      globals: {
        console: "readonly",
        Headers: "readonly",
        NodeJS: "readonly",
        process: "readonly",
        Request: "readonly",
        Response: "readonly"
      }
    },
    rules: {
      "no-undef": "off"
    }
  }
];
