import gramps from '@gramps/gramps';
import { ApolloServer } from 'apollo-server-express';
import playground from 'graphql-playground-middleware-express';

import { GRAPHQL_ENDPOINT, TESTING_ENDPOINT } from './constants';

const configureApp = async (app, config) => {
  const GraphQLOptions = await gramps({
    ...config,
    apollo: {
      graphqlExpress: {
        playground: false,
      },
    },
  });

  const server = new ApolloServer(GraphQLOptions);

  server.applyMiddleware({ app });

  app.use(TESTING_ENDPOINT, playground({ endpoint: GRAPHQL_ENDPOINT }));

  return app;
};

export default configureApp;
