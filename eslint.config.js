/** @type {import('@eslint/eslintrc').Linter.Config} */
module.exports = {
  extends: ['next/core-web-vitals'],
  ignorePatterns: ['**/node_modules/**', '.next/**', 'out/**', 'public/**'],
  rules: {
    '@next/next/no-html-link-for-pages': 'off'
  }
} 