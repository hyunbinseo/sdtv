const en = { pageTitle: 'About' };

const ko: typeof en = { pageTitle: '소개' };

export const t = import.meta.env.VITE_LOCALE === 'ko' ? ko : en;
