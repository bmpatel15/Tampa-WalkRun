import next from 'eslint-plugin-next';

export default [
  {
    ignores: [
      'node_modules/',
      'lib/generated/',
    ],
    plugins: {
      next,
    },
    rules: {
      ...next.configs.recommended.rules,
    },
  },
  // Add your other ESLint config objects below if needed
]; 