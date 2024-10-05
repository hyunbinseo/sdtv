const en = {
	noscript: 'JavaScript is not available. Enable it or switch to a supported browser.'
};

const ko: typeof en = {
	noscript:
		'자바스크립트를 사용할 수 없습니다. 이를 활성화하거나, 지원되는 브라우저로 접속해 주세요.'
};

export const t = import.meta.env.VITE_LOCALE === 'ko' ? ko : en;
