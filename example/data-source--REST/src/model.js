import { GraphQLModel } from '@gramps/rest-helpers';
import { GrampsError } from '@gramps/errors';

export default class OpenMovieDataSourceModel extends GraphQLModel {
  /**
   * Search a movie by title
   * @param  {String}  title  the title of the movie to search for
   * @param  {String}  apiKey the API key **NOTE**: Just an example. Not a good practice.
   * @return {Promise}     resolves with the loaded search results
   */
  searchMoviesByTitle({ title, apiKey }) {
    return this.connector
      .get(`/?apiKey=${apiKey}&type=movie&s=${title}`)
      .then(res => res.Search)
      .catch(res => this.handleError(res));
  }

  errorExample() {
    const res = {
      statusCode: 403,
      error: {
        error_code: 'FORBIDDEN',
        message: 'You do not have access to this resource.',
      },
      options: {
        uri: 'https://example.org/users/12345',
      },
    };

    return this.handleError(res, { user: '12345' });
  }

  /**
   * Throws a GrampsError using information from the error response.
   *
   * @see https://ibm.biz/graphql-helpers
   *
   * @param  {object} response  an error response
   * @return {void}
   */
  handleError(response, data = {}) {
    const defaultError = {
      // An HTTP status code (e.g. 404).
      statusCode: response.statusCode,
      // The endpoint that GraphQL was attempting to load (e.g. "https://api.example.org/user/123").
      targetEndpoint: response.options.uri,
      // Docs that might be helpful to the user
      docsLink: 'http://www.omdbapi.com/',
      // The class where the error originated. (Don’t change this.)
      graphqlModel: this.constructor.name,
      // Any data/args/etc you want to log
      data,
    };

    throw GrampsError({
      ...defaultError,
      // A human-readable description of what went wrong (e.g. "Page not found").
      description: response.error.message,
      // An error code for looking up troubleshooting info (e.g. "MyApp_Err_NotFound").
      errorCode: response.error.error_code,
    });
  }
}
