const en = {
	title: 'Admin',
	nav: {
		dashboard: 'Dashboard',
		roles: 'Roles',
		users: 'Users'
	}
};

const ko: typeof en = {
	title: '관리',
	nav: {
		dashboard: '대시보드',
		roles: '역할',
		users: '사용자'
	}
};

export const t = import.meta.env.VITE_LOCALE === 'ko' ? ko : en;
