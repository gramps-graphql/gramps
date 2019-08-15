import bodyParser from 'body-parser';
import gramps from '@gramps/gramps';
import { graphqlExpress } from 'apollo-server-express';
import playground from 'graphql-playground-middleware-express';

import { GRAPHQL_ENDPOINT, TESTING_ENDPOINT } from '.';

export default function configureApp(app, config) {
  const GraphQLOptions = gramps(config);

  app.use(bodyParser.json());
  app.use(GRAPHQL_ENDPOINT, graphqlExpress(GraphQLOptions));
  app.use(TESTING_ENDPOINT, playground({ endpoint: GRAPHQL_ENDPOINT }));

  return app;
}
