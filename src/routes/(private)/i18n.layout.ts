const en = {
	nav: {
		home: 'Home',
		admin: 'Admin',
		logout: 'Logout'
	},
	logo: 'Logo'
};

const ko: typeof en = {
	nav: {
		home: '홈',
		admin: '관리',
		logout: '로그아웃'
	},
	logo: '로고'
};

export const t = import.meta.env.VITE_LOCALE === 'ko' ? ko : en;
