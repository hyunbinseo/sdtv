import forms from '@tailwindcss/forms';
import plugin from 'tailwindcss/plugin';

/** @type {import('tailwindcss').Config} */
export default {
	content: ['./src/**/*.{html,js,svelte,ts}'],
	theme: { extend: {} },
	plugins: [
		forms,
		plugin(({ addComponents, addUtilities, addVariant }) => {
			// Actual styles are defined in the `app.css` file.
			// Key order matches the Prettier sorting order.
			addComponents({
				'.ua-anchor': {}
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
