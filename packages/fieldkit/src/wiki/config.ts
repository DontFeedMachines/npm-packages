import wiki from "virtual:dfm-fieldkit/wiki";

export const config = wiki.config;

export const getTranslations = async (lang: string) => wiki.menu[lang] ?? wiki.menu.en;
