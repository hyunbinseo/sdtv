import { PUBLIC_SITE_NAME } from '$env/static/public';

const en = {
	'pageTitle': 'Login',
	'continue': 'Continue',
	'email': 'Email',
	'login-as': 'Login as:',
	'login-using-otp': 'Login using OTP',
	'login': 'Login',
	'magic-link-is-invalid': 'Magic link is invalid.',
	'otp': 'OTP',
	'please-check-your-inbox': 'Please check your inbox.',
	'send-magic-link': 'Send Magic Link',
	'start-over': 'Start Over',
	'this-page-can-be-safely-closed': 'This page can be safely closed.',
	'template': (magicLink: URL, otp: string) => ({
		Subject: `Login to ${PUBLIC_SITE_NAME}`,
		HtmlBody: `<a href="${magicLink.toString()}">Login from this device</a> or enter OTP ${otp}`
	}),
	'error': {
		ACTIVE_MAGIC_LINK_EXISTS: 'Use the existing link first.',
		INCORRECT_OTP: 'OTP is incorrect.',
		LOGIN_EXPIRED: 'Login has expired.',
		MAGIC_LINK_SEND_FAILED: 'Failed to send. Try again later.'
	}
};

const ko: typeof en = {
	'pageTitle': '로그인',
	'continue': '계속하기',
	'email': '이메일',
	'login-as': '다음 정보로 로그인:',
	'login-using-otp': '대신 인증번호로 로그인',
	'login': '로그인',
	'magic-link-is-invalid': '잘못된 인증 링크입니다.',
	'otp': '인증번호',
	'please-check-your-inbox': '메일함을 확인해 주세요.',
	'send-magic-link': '인증 링크 전송',
	'start-over': '다시 시도하기',
	'this-page-can-be-safely-closed': '이 페이지는 닫으셔도 됩니다.',
	'template': (magicLink: URL, otp: string) => ({
		Subject: `${PUBLIC_SITE_NAME} 로그인`,
		HtmlBody: `<a href="${magicLink.toString()}">이 기기에서 로그인</a>하거나 인증번호 [${otp}]를 입력하세요.`
	}),
	'error': {
		ACTIVE_MAGIC_LINK_EXISTS: '앞서 발송된 링크를 먼저 사용해 주세요.',
		INCORRECT_OTP: '잘못된 인증번호입니다.',
		LOGIN_EXPIRED: '로그인 유효시간이 지났습니다.',
		MAGIC_LINK_SEND_FAILED: '발송하지 못했습니다. 나중에 다시 시도해 주세요.'
	}
};

export const t = import.meta.env.VITE_LOCALE === 'ko' ? ko : en;
