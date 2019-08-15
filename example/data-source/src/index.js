import typeDefs from './schema.graphql';
import resolvers from './resolvers';
import mocks from './mocks';
import Connector from './connector';
import Model from './model';

export default {
  namespace: 'OpenMovieDataSource',
  context: { model: new Model({ connector: new Connector() }) },
  typeDefs,
  resolvers,
  mocks,
};
