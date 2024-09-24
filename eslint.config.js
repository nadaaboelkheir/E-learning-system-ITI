module.exports = [
	{
		files: ['.js'],
		languageOptions: {
			ecmaVersion: 'latest',
			sourceType: 'module',
			globals: {
				browser: true,
				commonjs: true,
				es2021: true,
			},
		},
		rules: {
			'array-bracket-spacing': ['error', 'never'],
			'computed-property-spacing': ['error', 'never'],
			'no-mixed-spaces-and-tabs': ['error', 'smart-tabs'],
			'space-unary-ops': 'error',
			'space-infix-ops': 'error',
			'arrow-spacing': ['error', { before: true, after: true }],
			'semi-spacing': ['error', { before: false, after: false }],
			'no-extra-semi': 'error',
			'no-multi-spaces': 'error',
			'no-multiple-empty-lines': ['error', { max: 2, maxEOF: 0 }],
			'key-spacing': 'error',
			'object-curly-spacing': ['error', 'always'],
			'comma-spacing': ['error', { before: false, after: true }],
			'keyword-spacing': ['error', { before: true }],
			'padding-line-between-statements': [
				'error',
				{
					blankLine: 'always',
					prev: ['const', 'let', 'var'],
					next: '',
				},
				{
					blankLine: 'any',
					prev: ['const', 'let', 'var'],
					next: ['const', 'let', 'var'],
				},
			],
			'block-spacing': 'error',
			'linebreak-style': ['error', 'unix'],
			quotes: [2, 'single', { avoidEscape: true }],
			semi: ['error', 'always'],
			'no-console': 'off',
			'no-unused-vars': 'off',
			'semi-spacing': ['error', { before: false, after: true }],
		},
	},
	{
		files: ['.eslintrc.{js,cjs}'],
		languageOptions: {
			sourceType: 'script',
			globals: {
				node: true,
			},
		},
	},
];
