const en = {
	nav: {
		home: 'Home',
		about: 'About',
		login: 'Login',
		app: 'App'
	},
	logo: 'Logo'
};

const ko: typeof en = {
	nav: {
		home: '홈',
		about: '소개',
		login: '로그인',
		app: '앱'
	},
	logo: '로고'
};

export const t = import.meta.env.VITE_LOCALE === 'ko' ? ko : en;
