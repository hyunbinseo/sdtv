import eslint from '@eslint/js';
import prettier from 'eslint-config-prettier';
import globals from "globals";
import tseslint from 'typescript-eslint';

export default tseslint.config(
	eslint.configs.recommended,
	...tseslint.configs.recommended,
	prettier,
	{
		languageOptions: {
			globals: {
				...globals.browser,
				...globals.node
			}
		}
	},
	{
		rules: {
			'no-console': ['error', { allow: ['warn', 'error'] }],
			'no-restricted-imports': ['error', 'assert', 'node:assert']
		}
	}
);
