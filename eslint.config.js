import tsParser from '@typescript-eslint/parser'

export default [
  { ignores: ['**/dist/**', '**/.astro/**', '**/node_modules/**'] },
  {
    files: ['**/*.{ts,tsx,js,mjs}'],
    languageOptions: { parser: tsParser, parserOptions: { ecmaVersion: 'latest', sourceType: 'module' } },
    rules: { 'no-debugger': 'error', 'no-constant-condition': 'error' },
  },
]
