import GraphQLModel from '../src/GraphQLModel';

class TestModel extends GraphQLModel {}

describe('GraphQLModel', () => {
  it('fails if instantiated directly', () => {
    const willThrow = () => new GraphQLModel({ connector: {} });
    expect(willThrow).toThrow(
      Error,
      'Cannot construct GraphQLModel classes directly',
    );
  });

  it('properly instantiates the model with a connector', () => {
    const tm = new TestModel({ connector: 'test connector' });

    expect(tm.connector).toBe('test connector');
  });
});
