const en = { pageTitle: 'Home' };

const ko: typeof en = { pageTitle: '홈' };

export const t = import.meta.env.VITE_LOCALE === 'ko' ? ko : en;
