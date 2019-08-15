import GraphQLConnector from '../src/GraphQLConnector';
import GraphQLModel from '../src/GraphQLModel';
import * as helpers from '../src';

describe('@gramps/rest-helpers', () => {
  it('exports the GraphQLConnector', () => {
    expect(helpers.GraphQLConnector).toBe(GraphQLConnector);
  });

  it('exports the GraphQLModel', () => {
    expect(helpers.GraphQLModel).toBe(GraphQLModel);
  });
});
