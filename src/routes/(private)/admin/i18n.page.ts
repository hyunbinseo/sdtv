const en = { pageTitle: 'Dashboard' };

const ko: typeof en = { pageTitle: '대시보드' };

export const t = import.meta.env.VITE_LOCALE === 'ko' ? ko : en;
