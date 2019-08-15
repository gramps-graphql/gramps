export default {
  context: { test: () => 'Test' },
  typeDefs: `
    type Query {
      test: String
    }
  `,
  resolvers: {
    Query: {
      test: (_, __, context) => context.test(),
    },
  },
};
