import { GraphQLConnector } from '@gramps/rest-helpers';

export default class OpenMovieDataSourceConnector extends GraphQLConnector {
  /**
   * Connects to the OMDb API.
   * @see http://www.omdbapi.com/
   */
  constructor() {
    super();

    this.apiBaseUri = `http://omdbapi.com`;
  }

  enableCache = false;
}
