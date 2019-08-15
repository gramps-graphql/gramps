import typeDefs from './schema.graphql';

export default {
  namespace: 'DataSourceOne',
  context: { test: () => 'Test' },
  resolvers: {
    Query: {
      test: (_, __, context) => context.test(),
    },
  },
  typeDefs,
};
