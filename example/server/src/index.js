import express from 'express';
import { ApolloServer } from 'apollo-server-express';
import gramps from '@gramps/gramps';
import { formatError } from '@gramps/errors';

import RestDataSource from '../../data-source--REST';
import i18nDataSource from '../../data-source--i18n';

import { addI18nSupport } from './helpers/i18n';

const dataSources = [RestDataSource, i18nDataSource];

(async () => {
  const GraphQLOptions = await gramps({
    dataSources,
    enableMockData: false,
    apollo: {
      addMockFunctionsToSchema: {
        preserveResolvers: false,
      },
      graphqlExpress: {
        formatError: formatError(console),
        tracing: true,
        introspection: true,
        playground: true,
      },
    },
  });

  const server = new ApolloServer(GraphQLOptions);

  const app = express();

  addI18nSupport(app, dataSources);

  server.applyMiddleware({ app });

  app.listen({ port: 4000 }, () =>
    console.log(
      `🚀 Server ready at http://localhost:4000${server.graphqlPath}`,
    ),
  );
})();
