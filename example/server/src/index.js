const express = require('express');
const { ApolloServer } = require('apollo-server-express');
const gramps = require('@gramps/gramps').default;
const { deserializeError, formatError } = require('@gramps/errors');

const exampleDataSource = require('../../data-source/dist').default;

(async () => {
  const GraphQLOptions = await gramps({
    dataSources: [exampleDataSource],
    enableMockData: false,
    apollo: {
      addMockFunctionsToSchema: {
        preserveResolvers: false,
      },
      graphqlExpress: {
        formatError: err => {
          return formatError()(deserializeError(err));
        },
        tracing: true,
      },
    },
  });

  const server = new ApolloServer(GraphQLOptions);

  const app = express();

  server.applyMiddleware({ app });

  app.listen({ port: 4000 }, () =>
    console.log(
      `🚀 Server ready at http://localhost:4000${server.graphqlPath}`,
    ),
  );
})();
