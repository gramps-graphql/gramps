import { GraphQLModel } from '@gramps/rest-helpers';
import { GrampsError } from '@gramps/errors';

export default class OpenMovieDataSourceModel extends GraphQLModel {
  /**
   * Loads a thing by its ID
   * @param  {String}  id  the ID of the thing to load
   * @return {Promise}     resolves with the loaded user data
   */
  searchMoviesByTitle({ title, apiKey }) {
    return this.connector
      .get(`/?apiKey=${apiKey}&type=movie&s=${title}`)
      .then(res => res.Search)
      .catch(res => this.handleError(res));
  }

  /**
   * Throws a GrampsError using information from the error response.
   *
   * @see https://ibm.biz/graphql-helpers
   *
   * @param  {object} response  an error response
   * @return {void}
   */
  handleError(response) {
    const defaultError = {
      // An HTTP status code (e.g. 404).
      statusCode: response.statusCode,
      // The endpoint that GraphQL was attempting to load (e.g. "https://api.example.org/user/123").
      targetEndpoint: response.options.uri,
      // The class where the error originated. (Don’t change this.)
      graphqlModel: this.constructor.name,
    };

    throw GrampsError(
      {
        ...defaultError,
        // A human-readable description of what went wrong (e.g. "Page not found").
        description: response.error.message,
        // An error code for looking up troubleshooting info (e.g. "MyApp_Err_NotFound").
        errorCode: response.error.error_code,
      },
      true, // Serializes the error into JSON. Do not change.
    );
  }
}
