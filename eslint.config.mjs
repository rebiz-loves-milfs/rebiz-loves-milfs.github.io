import tsParser from '@typescript-eslint/parser';
import tsPlugin from '@typescript-eslint/eslint-plugin';
import sveltePlugin from 'eslint-plugin-svelte';
import svelteParser from 'svelte-eslint-parser';
import astroPlugin from 'eslint-plugin-astro';
import astroParser from 'astro-eslint-parser';

export default [
  // ── Ignores ──────────────────────────────────────────────────────────────
  {
    ignores: ['dist/**', '.astro/**', 'node_modules/**', '*.config.mjs'],
  },

  // ── TypeScript / JS ──────────────────────────────────────────────────────
  {
    files: ['src/**/*.{ts,js}'],
    languageOptions: {
      parser: tsParser,
      parserOptions: { project: './tsconfig.json', extraFileExtensions: ['.svelte', '.astro'] },
    },
    plugins: { '@typescript-eslint': tsPlugin },
    rules: {
      ...tsPlugin.configs.recommended.rules,
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
      'no-console': ['warn', { allow: ['warn', 'error'] }],
    },
  },

  // ── Svelte ───────────────────────────────────────────────────────────────
  {
    files: ['src/**/*.svelte'],
    languageOptions: {
      parser: svelteParser,
      parserOptions: {
        parser: tsParser,
        extraFileExtensions: ['.svelte'],
      },
    },
    plugins: { svelte: sveltePlugin },
    rules: {
      ...sveltePlugin.configs.recommended.rules,
      'svelte/no-unused-svelte-ignore': 'warn',
      'svelte/valid-compile': ['error', { ignoreWarnings: false }],
    },
  },

  // ── Astro ────────────────────────────────────────────────────────────────
  {
    files: ['src/**/*.astro'],
    languageOptions: {
      parser: astroParser,
      parserOptions: { parser: tsParser },
    },
    plugins: { astro: astroPlugin },
    rules: {
      ...astroPlugin.configs.recommended.rules,
    },
  },
];
