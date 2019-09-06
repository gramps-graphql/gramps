import preparei18nextResources from '../../src/helpers/preparei18nextResources';

describe('preparei18nextResources', () => {
  it('creates an i18next compatible resource bundle', () => {
    const dataSource1 = {
      namespace: 'MyDataSource1',
      locales: {
        en: {
          hello: 'Hello',
        },
        es: {
          hello: 'Hola',
        },
      },
    };

    const dataSource2 = {
      namespace: 'MyDataSource2',
      locales: {
        en: {
          world: 'world',
        },
        es: {
          world: 'mundo',
        },
      },
    };

    const dataSources = [dataSource1, dataSource2];

    const resources = preparei18nextResources(dataSources);

    expect(resources).toEqual({
      en: {
        MyDataSource1: {
          hello: 'Hello',
        },
        MyDataSource2: {
          world: 'world',
        },
      },
      es: {
        MyDataSource1: {
          hello: 'Hola',
        },
        MyDataSource2: {
          world: 'mundo',
        },
      },
    });
  });
});
