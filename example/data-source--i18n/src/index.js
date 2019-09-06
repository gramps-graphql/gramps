import typeDefs from './schema.graphql';
import resolvers from './resolvers';
import mocks from './mocks';

import en from './locales/en.json';
import es from './locales/es.json';
import zhCN from './locales/zh-cn.json';

const locales = {
  en,
  es,
  'zh-cn': zhCN,
};

export default {
  namespace: 'i18nDataSource',
  context: req => ({ req }),
  typeDefs,
  resolvers,
  mocks,
  locales,
};
