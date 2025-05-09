import js from "@eslint/js";
import globals from "globals";
import tseslint from "typescript-eslint";
import { defineConfig } from "eslint/config";
import sortKeysFix from "eslint-plugin-sort-keys-fix"
import importPlugin from 'eslint-plugin-import';

export default defineConfig([
  {
    ignores: [".config/", "dist/", "tsconfig.json", ".vinxi/", '.netlify/']
  },
  { extends: ["js/recommended"], files: ["scripts/**/*.{js,mjs,cjs,ts,tsx}", "src/**/*.{js,mjs,cjs,ts,tsx}"], plugins: { js } },
  { files: ["scripts/**/*.{js,mjs,cjs,ts,tsx}", "src/**/*.{js,mjs,cjs,ts,tsx}"], languageOptions: { globals: globals.browser } },
  {
    extends: [tseslint.configs.recommended],
    files: ["scripts/**/*.{js,mjs,cjs,ts,tsx}", "src/**/*.{js,mjs,cjs,ts,tsx}"],
    rules: {
      "@typescript-eslint/no-explicit-any": "off",
      "no-unused-vars": "off",
      "@typescript-eslint/no-unused-vars": [
        "warn",
        {
          "args": "all",
          "argsIgnorePattern": "^_",
          "caughtErrors": "all",
          "caughtErrorsIgnorePattern": "^_",
          "destructuredArrayIgnorePattern": "^_",
          "varsIgnorePattern": "^_",
          "ignoreRestSiblings": true
        }
      ],
      "no-use-before-define": "off",
      "@typescript-eslint/no-use-before-define": ["error", { functions: false, typedefs: false }]
    }
  },
  {
    extends: [importPlugin.flatConfigs.recommended, importPlugin.flatConfigs.typescript],
    files: ["scripts/**/*.{js,mjs,cjs,ts,tsx}", "src/**/*.{js,mjs,cjs,ts,tsx}"],
    rules: {
      'import/no-unresolved': 'off',
      'import/order': 'warn',
    },
  },
  {
    files: ["scripts/**/*.{js,mjs,cjs,ts,tsx}", "src/**/*.{js,mjs,cjs,ts,tsx}"],
    plugins: {
      "sort-keys-fix": sortKeysFix
    },
    rules: {
      "sort-keys-fix/sort-keys-fix": ["warn", "asc", { natural: true }],
    }
  },
  {
    files: ["scripts/**/*.{js,mjs,cjs,ts,tsx}", "src/**/*.{js,mjs,cjs,ts,tsx}"],
    rules: {
      "no-duplicate-imports": "warn",
      "no-implicit-coercion": "warn",
      "no-param-reassign": "warn",
      "no-unmodified-loop-condition": "warn",
      "no-unneeded-ternary": "warn",
      "no-useless-assignment": "warn",
      "sort-vars": "warn",
    }
  },
  {
    files: ["scripts/**/*.{js,mjs,cjs,ts,tsx}", "src/**/*.{js,mjs,cjs,ts,tsx}"],
    rules: {
      "eqeqeq": "off",
      "no-console": "off",
      "no-else-return": "off",
      "no-eq-null": "off",
      "prefer-const": "off",
      "require-await": "off",
    }
  },
]);
