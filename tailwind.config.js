import forms from '@tailwindcss/forms';
import defaultTheme from 'tailwindcss/defaultTheme';
import plugin from 'tailwindcss/plugin';

/** @type {import('tailwindcss').Config} */
export default {
	content: ['./src/**/*.{html,js,svelte,ts}'],
	theme: {
		// 320px: iPhone SE
		// 360px: Galaxy S24
		// 375px: iPhone SE (2020, 2022)
		// 384px: Galaxy S24+, S24 Ultra
		// 393px: iPhone 16
		// 402px: iPhone 16 Pro
		// 430px: iPhone 16 Plus
		// 440px: iPhone 16 Pro Max
		screens: { xs: '441px', ...defaultTheme.screens },
		extend: {
			boxShadow: {
				bottom: [
					'0px 2px 4px -3px rgba(0, 0, 0, 0.2)',
					'0px 4px 5px -2px rgba(0, 0, 0, 0.14)',
					'0px 1px 10px -10px rgba(0, 0, 0, 0.12)'
				].join(', '),
				top: [
					'0px -2px 4px -3px rgba(0, 0, 0, 0.2)',
					'0px -4px 5px -2px rgba(0, 0, 0, 0.14)',
					'0px -1px 10px -10px rgba(0, 0, 0, 0.12)'
				].join(', ')
			},
			width: { 'screen-xs': '441px' }
		}
	},
	plugins: [
		forms,
		plugin(({ addComponents, addUtilities, addVariant }) => {
			// Actual styles are defined in the `app.css` file.
			// Component order matches Prettier sorting order.
			addComponents({
				'.ua-anchor': {},
				'.tw-checkbox': {},
				'.tw-checkbox-checked': {},
				'.btn': {},
				'.btn-xs': {},
				'.btn-sm': {},
				'.btn-lg': {},
				'.btn-primary': {},
				'.btn-secondary': {},
				'.btn-danger': {},
				'.btn-spinner': {}
			});
			addUtilities({
				// Reference https://tailwindcss.com/docs/font-size
				'.text-smallish': {
					'font-size': '0.9375rem', // 15px
					'line-height': '1.375rem' // 22px
				}
			});
			// Reference https://developer.mozilla.org/en-US/docs/Web/CSS/@media/pointer
			addVariant('coarse', '@media (pointer: coarse)'); // e.g. finger on a touchscreen
			// Reference https://github.com/tailwindlabs/tailwindcss/pull/12370
			addVariant('user-valid', '&:user-valid');
			addVariant('user-invalid', '&:user-invalid');
		})
	],
	future: { hoverOnlyWhenSupported: true }
};
