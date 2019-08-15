import GraphQLConnector from '../src/GraphQLConnector';

class TestConnector extends GraphQLConnector {
  apiBaseUri = 'https://example.com/api/v1';
}

jest.mock('request-promise', () =>
  jest.fn(() =>
    Promise.resolve({
      statusCode: 200,
      headers: {
        'content-type': 'application/json',
      },
      body: {
        test: 'body',
      },
    }),
  ),
);

jest.mock('../src/defaultLogger', () => ({
  info: jest.fn(),
  error: jest.fn(),
}));

const mockRedis = {
  getClient: jest.fn(() => ({
    setex: jest.fn(),
    get: jest.fn(),
  })),
};

describe('GraphQLConnector', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('constructor()', () => {
    it('fails if instantiated directly', () => {
      expect.assertions(1);

      try {
        const x = new GraphQLConnector(); // eslint-disable-line no-unused-vars
      } catch (error) {
        expect(error).toEqual(
          Error('Cannot construct GraphQLConnector classes directly'),
        );
      }
    });
  });

  describe('class properties', () => {
    it('properly sets properties from classes that extend it', () => {
      const tc = new TestConnector();
      expect(tc.apiBaseUri).toEqual('https://example.com/api/v1');
    });
  });

  describe('getRequestConfig()', () => {
    it('properly returns a config object', () => {
      const tc = new TestConnector();

      expect(tc.getRequestConfig('http://example.com')).toEqual({
        uri: 'http://example.com',
        json: true,
        resolveWithFullResponse: true,
        headers: {},
      });
    });
  });

  describe('getRequestData()', () => {
    it('retrieves data from the data source if no cache exists', async () => {
      expect.assertions(2);
      const tc = new TestConnector();

      tc.redis = mockRedis.getClient();

      tc.redis.get = jest.fn((key, cb) => {
        cb(null, '{"test":"body"}');
      });

      return tc.getRequestData('https://example.com').then(result => {
        expect(result).toEqual({ test: 'body' });
        expect(tc.redis.setex).toHaveBeenCalled();
      });
    });

    it('resolves with cached data if a cache exists', async () => {
      expect.assertions(2);

      const tc = new TestConnector();

      tc.redis = mockRedis.getClient();

      // Mock the Redis get method to return cached data.
      tc.redis.get = jest.fn((key, cb) => {
        cb(null, '{"test":"cached"}');
      });

      return tc.getRequestData('https://example.com').then(result => {
        expect(result).toEqual({ test: 'cached' });

        // It should still make the request in the background, though.
        expect(tc.request).toHaveBeenCalled();
      });
    });

    it('resolves with body of request if cache is bad', async () => {
      expect.assertions(2);

      const tc = new TestConnector();

      tc.redis = mockRedis.getClient();

      // Mock the Redis get method to return cached data.
      tc.redis.get = jest.fn((key, cb) => {
        cb(null, '{"test":"truncated');
      });

      return tc.getRequestData('https://example.com').then(result => {
        expect(result).toEqual({ test: 'body' });

        // It should still make the request in the background, though.
        expect(tc.request).toHaveBeenCalled();
      });
    });

    it('rejects if there is an error with Redis', async () => {
      expect.assertions(1);

      const tc = new TestConnector();

      tc.redis = mockRedis.getClient();

      // Mock the Redis get method to reject.
      tc.redis.get = jest.fn((key, cb) => {
        cb('error', null);
      });

      return tc.getRequestData('https://example.com').catch(error => {
        expect(error).toEqual('error');
      });
    });

    it('doesn’t cache data if `enableCache` is false', async () => {
      expect.assertions(3);
      const tc = new TestConnector();

      tc.enableCache = false;
      tc.redis = mockRedis.getClient();

      return tc.getRequestData('https://example.com/').then(result => {
        expect(result).toEqual({ test: 'body' });
        expect(tc.redis.get).not.toHaveBeenCalled();
        expect(tc.redis.setex).not.toHaveBeenCalled();
      });
    });

    it('doesn’t cache if the status code is not 200', async () => {
      expect.assertions(2);

      const tc = new TestConnector();

      tc.redis = mockRedis.getClient();
      tc.redis.get = jest.fn((key, cb) => {
        cb(null, null);
      });

      tc.request.mockReturnValueOnce(
        Promise.resolve({
          statusCode: 404,
          body: {},
        }),
      );

      const result = await tc.getRequestData('https://example.com/');

      expect(result).toEqual({});
      expect(tc.redis.setex).not.toHaveBeenCalled();
    });

    it('throws a GrampsError if something goes wrong', async () => {
      expect.assertions(5);

      const tc = new TestConnector();
      tc.redis = mockRedis.getClient();

      tc.request = () => Promise.reject(Error('test error'));
      tc.redis.get = jest.fn((key, cb) => {
        cb(null, null);
      });

      return tc.getRequestData('https://example.com/rejectme').catch(error => {
        expect(error).toHaveProperty('isBoom', true);
        expect(error.output.statusCode).toBe(500);
        expect(error.output.payload.graphqlModel).toBe('TestConnector');
        expect(error.output.payload.targetEndpoint).toBe(
          'https://example.com/rejectme',
        );
        expect(error.output.payload.description).toEqual(
          expect.stringMatching(/test error/),
        );
      });
    });

    it('resolves with response headers if specified', async () => {
      expect.assertions(2);
      const tc = new TestConnector();

      tc.redis = mockRedis.getClient();
      tc.redis.get = jest.fn((key, cb) => {
        cb(null, null);
      });

      return tc
        .getRequestData('https://example.com', { resolveWithHeaders: true })
        .then(result => {
          expect(result).toEqual({
            headers: {
              'content-type': 'application/json',
            },
            body: {
              test: 'body',
            },
          });
          expect(tc.redis.setex).toHaveBeenCalled();
        });
    });

    it('does not cache if specified in options', async () => {
      expect.assertions(3);
      const tc = new TestConnector();

      tc.redis = mockRedis.getClient();

      return tc
        .getRequestData('https://example.com', { cacheExpiry: 0 })
        .then(result => {
          expect(result).toEqual({ test: 'body' });
          expect(tc.redis.get).not.toHaveBeenCalled();
          expect(tc.redis.setex).not.toHaveBeenCalled();
        });
    });

    it('Caches for a longer time if passed in custom cache time in options', async () => {
      expect.assertions(4);
      const tc = new TestConnector();

      tc.redis = mockRedis.getClient();
      tc.redis.get = jest.fn((key, cb) => {
        cb(null, '{"test":"body"}');
      });

      return tc
        .getRequestData('https://example.com', { cacheExpiry: 36000 })
        .then(result => {
          expect(result).toEqual({ test: 'body' });
          expect(tc.redis.get).toHaveBeenCalled();
          expect(tc.redis.setex.mock.calls[0][1]).toEqual(36000);
          expect(tc.redis.setex.mock.calls[0][2]).toEqual('{"test":"body"}');
        });
    });

    it('Sets a second key in redis to keep track of when not to call API call if option is passed in', async () => {
      expect.assertions(7);
      const tc = new TestConnector();

      tc.redis = mockRedis.getClient();
      tc.redis.get = jest.fn((key, cb) => {
        cb(null, null);
      });

      return tc
        .getRequestData('https://example.com', {
          cacheRefresh: 1800,
          cacheExpiry: 36000,
        })
        .then(result => {
          expect(result).toEqual({ test: 'body' });
          expect(tc.redis.get).toHaveBeenCalled();
          const redisKey = tc.redis.setex.mock.calls[1][0];
          expect(tc.redis.setex.mock.calls[0][0]).toEqual(
            `REFRESH_CACHE_${redisKey}`,
          );
          expect(tc.redis.setex.mock.calls[0][1]).toEqual(1800);
          expect(tc.redis.setex.mock.calls[0][2]).toEqual('true');
          expect(tc.redis.setex.mock.calls[1][1]).toEqual(36000);
          expect(tc.redis.setex.mock.calls[1][2]).toEqual('{"test":"body"}');
        });
    });

    it('checks if refresh cache is needed, and if key is still set, do not make request', async () => {
      expect.assertions(4);
      const tc = new TestConnector();

      tc.makeRequest = jest.fn();
      tc.redis = mockRedis.getClient();
      tc.redis.get = jest.fn((key, cb) => {
        if (key.indexOf('REFRESH') !== -1) {
          cb(null, 'true');
        } else {
          cb(null, '{"test":"body"}');
        }
      });

      return tc
        .getRequestData('https://example.com', {
          cacheRefresh: 1800,
          cacheExpiry: 36000,
        })
        .then(result => {
          expect(result).toEqual({ test: 'body' });
          expect(tc.makeRequest).not.toHaveBeenCalled();
          expect(tc.redis.get).toHaveBeenCalledTimes(2);
          expect(tc.redis.setex).not.toHaveBeenCalled();
        });
    });

    it('checks if refresh cache is needed, and if key is not set, make request', async () => {
      expect.assertions(7);
      const tc = new TestConnector();

      tc.redis = mockRedis.getClient();
      tc.redis.get = jest.fn((key, cb) => {
        if (key.indexOf('REFRESH') !== -1) {
          cb(null, null);
        } else {
          cb(null, '{"test":"body"}');
        }
      });

      return tc
        .getRequestData('https://example.com', {
          cacheRefresh: 1800,
          cacheExpiry: 36000,
        })
        .then(result => {
          expect(result).toEqual({ test: 'body' });
          expect(tc.redis.get).toHaveBeenCalledTimes(2);
          const redisKey = tc.redis.setex.mock.calls[1][0];
          expect(tc.redis.setex.mock.calls[0][0]).toEqual(
            `REFRESH_CACHE_${redisKey}`,
          );
          expect(tc.redis.setex.mock.calls[0][1]).toEqual(1800);
          expect(tc.redis.setex.mock.calls[0][2]).toEqual('true');
          expect(tc.redis.setex.mock.calls[1][1]).toEqual(36000);
          expect(tc.redis.setex.mock.calls[1][2]).toEqual('{"test":"body"}');
        });
    });
  });

  describe('load()', () => {
    it('properly loads two URIs in a batch', () => {
      expect.assertions(4);

      const uris = ['https://example.com', 'https://ibm.com'];
      const tc = new TestConnector();

      tc.getRequestData = jest.fn(() => Promise.resolve(true));

      return tc.load(uris).then(result => {
        expect(result).toEqual([true, true]);
        expect(tc.getRequestData).toHaveBeenCalledTimes(2);
        expect(tc.getRequestData.mock.calls[0][0]).toEqual(uris[0]);
        expect(tc.getRequestData.mock.calls[1][0]).toEqual(uris[1]);
      });
    });
  });

  describe('get()', () => {
    it('uses the DataLoader to send GET requests', () => {
      const tc = new TestConnector();

      tc.apiBaseUri = 'https://example.com';

      tc.load = jest.fn(() => Promise.resolve([{}]));

      tc.get('/test/endpoint');

      expect(tc.load).toHaveBeenCalledWith([
        'https://example.com/test/endpoint',
      ]);
    });

    it('bypasses the DataLoader if additional options are passed in', () => {
      const tc = new TestConnector();

      tc.apiBaseUri = 'https://example.com';

      tc.getRequestData = jest.fn(() => Promise.resolve({}));

      tc.get('/test/endpoint', { foo: 'bar' });

      expect(tc.getRequestData).toHaveBeenCalledWith(
        'https://example.com/test/endpoint',
        { foo: 'bar' },
      );
    });
  });

  describe('post()', () => {
    it('sends a properly configured POST request', () => {
      const tc = new TestConnector();

      tc.apiBaseUri = 'https://example.com';
      tc.post('/test/post');

      expect(tc.request).toHaveBeenCalledWith({
        uri: 'https://example.com/test/post',
        json: true,
        resolveWithFullResponse: true,
        headers: {},
        method: 'POST',
        body: {},
      });
    });

    it('adds the body as expected', () => {
      const tc = new TestConnector();

      tc.apiBaseUri = 'https://example.com';
      tc.post('/test/post', { test: 'body' });

      expect(tc.request).toHaveBeenCalledWith(
        expect.objectContaining({
          body: {
            test: 'body',
          },
        }),
      );
    });

    it('adds custom options as expected', () => {
      const tc = new TestConnector();

      tc.apiBaseUri = 'https://example.com';
      tc.post('/test/post', { test: 'body' }, { custom: 'option' });

      expect(tc.request).toHaveBeenCalledWith(
        expect.objectContaining({
          custom: 'option',
        }),
      );
    });

    it('omits the body if the formData option is present', () => {
      const tc = new TestConnector();

      tc.apiBaseUri = 'https://example.com';
      tc.post('/test/post', null, { formData: 'blob' });

      expect(tc.request).toHaveBeenCalledWith(
        expect.not.objectContaining({
          body: {},
        }),
      );
    });
  });

  describe('put()', () => {
    it('sends a properly configured PUT request', () => {
      const tc = new TestConnector();

      tc.apiBaseUri = 'https://example.com';
      tc.put('/test/put');

      expect(tc.request).toHaveBeenCalledWith({
        uri: 'https://example.com/test/put',
        json: true,
        resolveWithFullResponse: true,
        headers: {},
        method: 'PUT',
        body: {},
      });
    });

    it('adds the body as expected', () => {
      const tc = new TestConnector();

      tc.apiBaseUri = 'https://example.com';
      tc.put('/test/put', { test: 'body' });

      expect(tc.request).toHaveBeenCalledWith(
        expect.objectContaining({
          body: {
            test: 'body',
          },
        }),
      );
    });

    it('adds custom options as expected', () => {
      const tc = new TestConnector();

      tc.apiBaseUri = 'https://example.com';
      tc.put('/test/put', { test: 'body' }, { custom: 'option' });

      expect(tc.request).toHaveBeenCalledWith(
        expect.objectContaining({
          custom: 'option',
        }),
      );
    });

    it('omits the body if the formData option is present', () => {
      const tc = new TestConnector();

      tc.apiBaseUri = 'https://example.com';
      tc.put('/test/put', null, { formData: 'blob' });

      expect(tc.request).toHaveBeenCalledWith(
        expect.not.objectContaining({
          body: {},
        }),
      );
    });
  });

  describe('patch()', () => {
    it('sends a properly configured PATCH request', () => {
      const tc = new TestConnector();

      tc.apiBaseUri = 'https://example.com';
      tc.patch('/test/patch');

      expect(tc.request).toHaveBeenCalledWith({
        uri: 'https://example.com/test/patch',
        json: true,
        resolveWithFullResponse: true,
        headers: {},
        method: 'PATCH',
        body: {},
      });
    });

    it('adds the body as expected', () => {
      const tc = new TestConnector();

      tc.apiBaseUri = 'https://example.com';
      tc.patch('/test/patch', { test: 'body' });

      expect(tc.request).toHaveBeenCalledWith(
        expect.objectContaining({
          body: {
            test: 'body',
          },
        }),
      );
    });

    it('adds custom options as expected', () => {
      const tc = new TestConnector();

      tc.apiBaseUri = 'https://example.com';
      tc.patch('/test/patch', { test: 'body' }, { custom: 'option' });

      expect(tc.request).toHaveBeenCalledWith(
        expect.objectContaining({
          custom: 'option',
        }),
      );
    });

    it('omits the body if the formData option is present', () => {
      const tc = new TestConnector();

      tc.apiBaseUri = 'https://example.com';
      tc.patch('/test/patch', null, { formData: 'blob' });

      expect(tc.request).toHaveBeenCalledWith(
        expect.not.objectContaining({
          body: {},
        }),
      );
    });
  });

  describe('delete()', () => {
    it('sends a properly configured DELETE request', () => {
      const tc = new TestConnector();

      tc.apiBaseUri = 'https://example.com';
      tc.delete('/test/delete');

      expect(tc.request).toHaveBeenCalledWith({
        uri: 'https://example.com/test/delete',
        json: true,
        resolveWithFullResponse: true,
        headers: {},
        method: 'DELETE',
      });
    });

    it('adds custom options as expected', () => {
      const tc = new TestConnector();

      tc.apiBaseUri = 'https://example.com';
      tc.delete('/test/delete', { custom: 'option' });

      expect(tc.request).toHaveBeenCalledWith(
        expect.objectContaining({
          custom: 'option',
        }),
      );
    });
  });

  describe('head()', () => {
    it('sends a properly configured HEAD request', () => {
      const tc = new TestConnector();

      tc.apiBaseUri = 'https://example.com';
      tc.head('/test/head');

      expect(tc.request).toHaveBeenCalledWith({
        uri: 'https://example.com/test/head',
        json: true,
        resolveWithFullResponse: true,
        headers: {},
        method: 'HEAD',
      });
    });

    it('adds custom options as expected', () => {
      const tc = new TestConnector();

      tc.apiBaseUri = 'https://example.com';
      tc.head('/test/head', { custom: 'option' });

      expect(tc.request).toHaveBeenCalledWith(
        expect.objectContaining({
          custom: 'option',
        }),
      );
    });
  });
});
