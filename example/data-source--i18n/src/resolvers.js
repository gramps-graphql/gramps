export default {
  Query: {
    sayHello: (rootValue, args, context) =>
      context.req.t('i18nDataSource:hello'),
  },
};
