import js from '@eslint/js';
import reactHooks from 'eslint-plugin-react-hooks';
import tseslint from 'typescript-eslint';

export default tseslint.config(
  {
    ignores: [
      'dist/**',
      'build/**',
      'coverage/**',
      'node_modules/**',
      'shopify-theme/**',
      'tests/**',
      'theme/**',
      '*.tsbuildinfo'
    ]
  },
  js.configs.recommended,
  {
    files: ['**/*.js'],
    languageOptions: {
      globals: {
        console: 'readonly',
        process: 'readonly'
      }
    }
  },
  ...tseslint.configs.recommended,
  {
    files: ['**/*.{ts,tsx}'],
    languageOptions: {
      globals: {
        console: 'readonly',
        document: 'readonly',
        process: 'readonly',
        window: 'readonly'
      },
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname
      }
    },
    plugins: {
      'react-hooks': reactHooks
    },
    rules: {
      ...reactHooks.configs.recommended.rules,
      '@typescript-eslint/consistent-type-imports': 'error'
    }
  }
);
