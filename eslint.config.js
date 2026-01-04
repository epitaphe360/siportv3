import js from '@eslint/js';
import globals from 'globals';
import reactHooks from 'eslint-plugin-react-hooks';
import reactRefresh from 'eslint-plugin-react-refresh';
import tseslint from 'typescript-eslint';

export default tseslint.config(
  { ignores: ['dist', 'android', 'ios', 'coverage', 'public', 'node_modules', '**/*.d.ts'] },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    files: ['**/*.{ts,tsx}'],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
    },
    plugins: {
      'react-hooks': reactHooks,
      'react-refresh': reactRefresh,
    },
    rules: {
      ...reactHooks.configs.recommended.rules,
      'react-refresh/only-export-components': [
        'warn',
        { allowConstantExport: true },
      ],
      // Project-wide relaxations to reduce noise and unblock CI
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-require-imports': 'off',
      '@typescript-eslint/no-unused-vars': [
        'warn',
        { argsIgnorePattern: '^_', varsIgnorePattern: '^_', ignoreRestSiblings: true }
      ],
      '@typescript-eslint/no-unused-expressions': 'off',
      'prefer-const': 'warn',
    },
  },
  // Node.js scripts and config files
  {
    files: ['scripts/**/*.{js,mjs,cjs,ts}', 'server/**/*.{js,mjs,cjs,ts}', '*.{js,mjs,cjs,ts}', '**/*.config.{js,ts,mjs,cjs}'],
    languageOptions: {
      globals: {
        ...globals.node,
      },
      ecmaVersion: 2022,
      sourceType: 'module',
    },
    rules: {
      '@typescript-eslint/no-var-requires': 'off',
      '@typescript-eslint/no-require-imports': 'off',
      '@typescript-eslint/no-unused-vars': 'off',
      'no-undef': 'off',
      'no-useless-escape': 'off',
      'no-empty': 'off',
      'no-console': 'off',
      'no-process-exit': 'off'
    }
  },
  // File-specific overrides
  {
    files: ['src/lib/supabase.ts'],
    rules: {
      // Allow ambient var declarations inside declare global {}
      'no-var': 'off',
    }
  }
);
