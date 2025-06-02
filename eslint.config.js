import eslintPluginReact from 'eslint-plugin-react';
import eslintPluginReactHooks from 'eslint-plugin-react-hooks';
import js from '@eslint/js';
import tseslint from '@typescript-eslint/eslint-plugin';
import tsParser from '@typescript-eslint/parser';
import prettier from 'eslint-config-prettier';

export default [
    // 👇 Primera sección: ignores
    {
        ignores: [
            'node_modules/',
            'dist/',
            'build/',
            '.vite/',
            'coverage/',
            '.idea/',
            '.vscode/',
            '*.tsbuildinfo',
            'npm-debug.log*',
            'yarn-debug.log*',
            'pnpm-debug.log*',
            '.DS_Store',
        ],
    },
    js.configs.recommended,
    {
        files: ['**/*.ts', '**/*.tsx'],
        languageOptions: {
            parser: tsParser,
            parserOptions: {
                ecmaVersion: 'latest',
                sourceType: 'module',
                project: './tsconfig.json',
            },
        },
        plugins: {
            '@typescript-eslint': tseslint,
        },
        rules: {
            ...tseslint.configs.recommended.rules,
        },
    },
    {
        plugins: {
            react: eslintPluginReact,
            'react-hooks': eslintPluginReactHooks,
        },
        settings: {
            react: {
                version: 'detect',
            },
        },
        rules: {
            'react/react-in-jsx-scope': 'off',
            'react/prop-types': 'off',
        },
    },
    prettier,
];
