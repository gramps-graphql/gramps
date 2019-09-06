import i18next from 'i18next';
import locale from 'locale';
import middleware from 'i18next-express-middleware';
import { preparei18nextResources } from '@gramps/gramps';

const supportedLanguages = [
  'de',
  'en',
  'es',
  'fr',
  'it',
  'ja',
  'ko',
  'pt-br',
  'zh-cn',
  'zh-tw',
];

/**
 * Adds i18n support to a given Express app.
 *
 * @see https://www.i18next.com/configuration-options.html
 *
 * @param  {Express} app  an Express app
 * @return {void}
 */
export const addI18nSupport = (app, dataSources) => {
  const resources = preparei18nextResources(dataSources);

  // Explicitly declare which languages we have i18n support for.
  app.use(locale(supportedLanguages));

  // Configure i18next to load our translation files.
  i18next.use(middleware.LanguageDetector).init({
    resources,
    fallbackLng: 'en',
    lowerCaseLng: true,
    whitelist: supportedLanguages,
  });

  // Add i18next middleware to our Express app.
  app.use(middleware.handle(i18next));
};

export default {
  addI18nSupport,
};
