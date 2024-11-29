const en = {
	'pageTitle': 'Manage Users',
	'contact': 'Contact',
	'deactivate': 'Deactivate',
	'deactivated-at': 'Deactivated At',
	'name': 'Name',
	'no-data-to-show': 'No data to show.',
	'reset': 'Reset',
	'select': 'Select',
	'show-active-users': 'Show Active Users',
	'show-deactivated-users': 'Show Deactivated Users'
};

const ko: typeof en = {
	'pageTitle': '사용자 관리',
	'contact': '연락처',
	'deactivate': '비활성화',
	'deactivated-at': '비활성화 일자',
	'name': '이름',
	'no-data-to-show': '표시할 정보가 없습니다.',
	'reset': '선택 해제',
	'select': '선택',
	'show-active-users': '활성 사용자 표시',
	'show-deactivated-users': '비활성화된 사용자 표시'
};

export const t = import.meta.env.VITE_LOCALE === 'ko' ? ko : en;
