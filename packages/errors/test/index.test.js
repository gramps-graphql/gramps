import { ApolloError, ValidationError } from 'apollo-server-express';
import { formatError, formatClientErrorData, GrampsError } from '../src';

const defaultLogger = {
  info: jest.fn(),
  error: jest.fn(),
};

describe('GrAMPS Errors', () => {
  describe('formatError', () => {
    it('returns a properly formatted GrAMPS error', () => {
      // This lets us mock a GrAMPS error that has gone through ApolloServer's `formatError` function
      const mockError = {
        message: 'Forbidden',
        locations: [],
        path: ['errorExample'],
        extensions: {
          code: 403,
          exception: {
            data: {
              user: '12345',
            },
            isBoom: true,
            isServer: false,
            output: {
              statusCode: 403,
              payload: {
                statusCode: 403,
                error: 'Forbidden',
                description: 'You do not have access to this resource.',
                errorCode: 'FORBIDDEN',
                graphqlModel: 'OpenMovieDataSourceModel',
                targetEndpoint: 'https://example.org/users/12345',
                docsLink: 'http://www.omdbapi.com/',
                message: null,
                locations: null,
                path: null,
                guid: '70407fb2-5679-4676-a6c5-899263c3a9e6',
              },
              headers: {},
            },
            stacktrace: [
              'Error: Forbidden',
              '    at GrampsError (/Users/someuser/dev/gramps/packages/errors/dist/index.js:98:10)',
            ],
          },
        },
      };

      mockError.originalError = new ApolloError();

      const formattedError = formatError(defaultLogger)(mockError);

      expect(formattedError.statusCode).toBe(403);
      expect(formattedError.description).toBe(
        'You do not have access to this resource.',
      );
      expect(formattedError.errorCode).toBe('FORBIDDEN');
    });

    it('converts a syntax error into a GrAMPS error ', () => {
      const error = new ValidationError(
        'Cannot query field "Unknown" on type "EXPL_Type".',
      );

      error.locations = [
        {
          line: 8,
          column: 5,
        },
      ];

      const formattedError = formatError(defaultLogger)(error);

      expect(formattedError.errorCode).toBe('GRAPHQL_VALIDATION_FAILED');
      expect(formattedError.locations).toEqual(error.locations);
    });

    it('can handle non-Apollo errors', () => {
      const mockError = {
        message: 'Oops!',
        locations: [
          {
            line: 12,
            column: 3,
          },
        ],
        path: ['errorExample'],
        extensions: {
          code: 'INTERNAL_SERVER_ERROR',
          exception: {
            errors: [
              {
                message: 'Oops!',
                locations: [],
                path: ['errorExample'],
              },
            ],
            stacktrace: ['Error: Oops!'],
          },
        },
      };

      const formattedError = formatError(defaultLogger)(mockError);

      expect(formattedError.message).toBe('Oops!');
      expect(formattedError.errorCode).toBe('GRAMPS_ERROR');
      expect(formattedError.statusCode).toBe(500);
    });

    it('uses the console if no defaultLogger is provided', () => {
      // eslint-disable-next-line no-global-assign, no-console
      console.error = jest.fn();

      formatError()({
        extensions: {},
      });

      // eslint-disable-next-line no-console
      expect(console.error).toHaveBeenCalled();
    });
  });

  describe('formatClientErrorData', () => {
    it('scrubs the targetEndpoint and docsLink in production', () => {
      process.env.NODE_ENV = 'production';

      const error = formatClientErrorData({
        description: 'There was an error',
        targetEndpoint: 'https://example.com/user/1234',
        docsLink: 'https://example.com/internal-docs',
      });

      expect(error).toEqual({
        description: 'There was an error',
      });
    });
  });

  describe('GrAMPSError', () => {
    it('generates a SevenBoom error by default', () => {
      const error = GrampsError();
      const defaultError = 'Internal Server Error';
      const defaultErrorCode = 'GRAMPS_ERROR';

      expect(error.isBoom).toBe(true);
      expect(error.isServer).toBe(true);
      expect(error.message).toBe(defaultError);
      expect(error.output.statusCode).toBe(500);
      expect(error.output.payload.statusCode).toBe(500);
      expect(error.output.payload.error).toBe(defaultError);
      expect(error.output.payload.message).toBeNull();
      expect(error.output.payload.description).toBeNull();
      expect(error.output.payload.errorCode).toBe(defaultErrorCode);
      expect(error.output.payload.graphqlModel).toBeNull();
      expect(error.output.payload.targetEndpoint).toBeNull();
      expect(error.output.payload.docsLink).toBeNull();
      expect(error.output.payload.guid).toBeTruthy();
    });

    it('creates custom errors', () => {
      const error = GrampsError({
        statusCode: 418,
        message: 'error message',
        description: 'error description',
        graphqlModel: 'TestModel',
        targetEndpoint: 'https://example.org/test/endpoint',
        docsLink: 'https://example.org/docs',
      });

      expect(error.isBoom).toBe(true);
      expect(error.output.statusCode).toBe(418);
      expect(error.output.payload.message).toBe('error message');
      expect(error.output.payload.description).toBe('error description');
      expect(error.output.payload.graphqlModel).toBe('TestModel');
      expect(error.output.payload.targetEndpoint).toBe(
        'https://example.org/test/endpoint',
      );
      expect(error.output.payload.docsLink).toBe('https://example.org/docs');
    });
  });
});
