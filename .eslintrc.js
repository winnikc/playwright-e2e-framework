module.exports = {
    root: true,
    parser: '@typescript-eslint/parser',
    parserOptions: {
        ecmaVersion: 2022,
        sourceType: 'module',
        project: './tsconfig.json',
    },
    plugins: ['@typescript-eslint', 'playwright'],
    extends: [
        'eslint:recommended',
        'plugin:@typescript-eslint/recommended',
        'plugin:playwright/recommended',
        'prettier',
    ],
    env: {
        node: true,
        es2022: true,
    },
    rules: {
        // TypeScript specific rules
        '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
        '@typescript-eslint/explicit-function-return-type': 'off',
        '@typescript-eslint/explicit-module-boundary-types': 'off',
        '@typescript-eslint/no-explicit-any': 'warn',
        '@typescript-eslint/no-non-null-assertion': 'warn',

        // Playwright specific rules
        'playwright/no-focused-test': 'error',
        'playwright/no-skipped-test': 'warn',
        'playwright/valid-expect': 'error',
        'playwright/prefer-to-be': 'warn',
        'playwright/prefer-to-have-length': 'warn',

        // General rules
        'no-console': 'off', // Allow console for logging
        'prefer-const': 'error',
        'no-var': 'error',
        'eqeqeq': ['error', 'always'],
        'curly': ['error', 'all'],
    },
    ignorePatterns: [
        'node_modules/',
        'dist/',
        'playwright-report/',
        'test-results/',
        'reports/',
        '*.js',
        '!.eslintrc.js',
    ],
};
