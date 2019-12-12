import fetchMock from 'fetch-mock';

import handleRemoteSchemas from '../../src/lib/handleRemoteSchemas';
import remoteIntrospectionSchema from '../fixtures/remoteIntrospectionSchema';

describe('lib/handleRemoteSchemas', () => {
  it('requests a schema from the remote url', async () => {
    fetchMock.mock(
      'http://coolremotegraphqlserver.com/graphql',
      remoteIntrospectionSchema,
    );

    const remoteSchema = await handleRemoteSchemas([
      {
        namespace: 'coolremotegraphqlserver',
        remoteSchema: {
          url: 'http://coolremotegraphqlserver.com/graphql',
        },
      },
    ]);

    expect(typeof remoteSchema).toBe('object');
  });

  it('adds context if a setContextCallback is set', async () => {
    fetchMock.mock(
      'http://coolremotegraphqlserver.com/graphql',
      remoteIntrospectionSchema,
    );

    await handleRemoteSchemas([
      {
        namespace: 'coolremotegraphqlserver',
        remoteSchema: {
          url: 'http://coolremotegraphqlserver.com/graphql',
          setContextCallback: () => ({
            headers: {
              Authorization: '123',
            },
          }),
        },
      },
    ]);

    expect(fetchMock._calls[0][1].headers.Authorization).toBe('123');
  });

  it('adds prefixes if a prefix is set', async () => {
    fetchMock.mock(
      'http://coolremotegraphqlserver.com/graphql',
      remoteIntrospectionSchema,
    );

    const remoteSchema = await handleRemoteSchemas([
      {
        namespace: 'coolremotegraphqlserver',
        remoteSchema: {
          url: 'http://coolremotegraphqlserver.com/graphql',
          prefix: 'CRG',
        },
      },
    ]);

    expect(remoteSchema[0]._typeMap.CRG_Book).toBeTruthy();
  });

  it('handles errors if the url is failing on production', async () => {
    process.env.NODE_ENV = 'production';
    fetchMock.mock(
      'http://coolremotegraphqlserver.com/graphql',
      remoteIntrospectionSchema,
    );
    fetchMock.mock('http://coolremotegraphqlserver2.com/graphql', 404);

    process.exit = jest.fn();

    await handleRemoteSchemas([
      {
        namespace: 'coolremotegraphqlserver',
        remoteSchema: {
          url: 'http://coolremotegraphqlserver.com/graphql',
        },
      },
      {
        namespace: 'coolremotegraphqlserver',
        remoteSchema: {
          url: 'http://coolremotegraphqlserver2.com/graphql',
        },
      },
    ]);

    expect(process.exit).toHaveBeenCalledWith(1);
  });

  it('handles errors if the url is failing and exitOnRemoteFail is set to false', async () => {
    fetchMock.mock(
      'http://coolremotegraphqlserver3.com/graphql',
      remoteIntrospectionSchema,
    );
    fetchMock.mock('http://coolremotegraphqlserver4.com/graphql', 404);

    const remoteSchema = await handleRemoteSchemas([
      {
        namespace: 'coolremotegraphqlserver',
        remoteSchema: {
          url: 'http://coolremotegraphqlserver3.com/graphql',
        },
      },
      {
        namespace: 'coolremotegraphqlserver',
        remoteSchema: {
          url: 'http://coolremotegraphqlserver4.com/graphql',
          exitOnRemoteFail: false,
        },
      },
    ]);

    expect(remoteSchema.length).toBe(1);
  });

  afterEach(() => {
    fetchMock.restore();
  });
});
