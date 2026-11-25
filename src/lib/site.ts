// Адрес сайта для поисковиков и ссылок в соцсетях. Когда подключим свой домен — поменять здесь
// или задать переменную окружения SITE_URL.
export const SITE_URL = (process.env.SITE_URL || "https://katy-shop.romancome-to-see.workers.dev").replace(/\/$/, "");
export const abs = (u: string) => (/^https?:\/\//.test(u) ? u : `${SITE_URL}${u.startsWith("/") ? "" : "/"}${u}`);
