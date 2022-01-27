import crypto from 'crypto';
import DataLoader from 'dataloader';
import rp from 'request-promise';
import {
  getCached,
  isCacheEnabled,
  addToCache,
  refreshCache,
} from './cacheUtils';

import defaultLogger from './defaultLogger';
/**
 * An abstract class to lay groundwork for data connectors.
 */
export default class GraphQLConnector {
  /**
   * Bluemix requests require a bearer token. This is retrieved by
   * `@console/console-platform-express-session` and stored in `req.user.token`
   * for each Express request. This is passed to the class in the config object
   * for the `GraphQLConnector` constructor.
   * @type {object}
   */
  headers = {};

  /**
   * Set `request-promise` as a class property.
   * @type {RequestPromise}
   */
  request = rp;

  /**
   * How long to cache GET requests by default.
   * @type {number}
   */
  cacheExpiry = 300;

  /**
   * If true, GET requests will be cached for `this.cacheExpiry` seconds.
   * @type {boolean}
   */
  enableCache = true;

  redis = false;

  logger = defaultLogger;

  /**
   * Define required props and create an instance of DataLoader.
   * @constructs GraphQLConnector
   * @param  {object} expressRequest  the request object from Express
   * @return {void}
   */
  constructor() {
    if (new.target === GraphQLConnector) {
      throw new Error('Cannot construct GraphQLConnector classes directly');
    }
  }

  /**
   * Get configuration options for `request-promise`.
   * @param  {string} uri the URI where the request should be sent
   * @return {object}
   */
  getRequestConfig = (uri, options = {}) => ({
    ...options,
    uri,
    json: true,
    resolveWithFullResponse: true,
    headers: { ...this.headers, ...options.headers },
  });

  makeRequest = (uri, options, key, resolve, reject = () => {}) => {
    this.logger.info(`Making request to ${uri}`);
    this.request(this.getRequestConfig(uri, options))
      .then(({ headers, body, statusCode }) => {
        const data = options.resolveWithHeaders ? { headers, body } : body;

        // If the data came through alright, cache it.
        if (statusCode === 200) {
          addToCache(this, key, uri, options, data);
        }

        return data;
      })
      .then(response => {
        this.headers = {};
        if (resolve) {
          resolve(response);
        }
      })
      .catch(error => {
        this.headers = {};
        reject(error);
      });
  };

  /**
   * Executes a request for data from a given URI
   * @param  {string}  uri  the URI to load
   * @param  {object}  args
   * @param  {boolean} args.resolveWithHeaders returns the headers along with the response body
   * @param  {number}  args.cacheExpiry: number of seconds to cache this API request instead of using default expiration.
   *                                        Passing in 0 indicates you want this to NOT get cached at all
   * @param  {number}  args.cacheRefresh: If this is passed in, number of seconds that must elapse before the GET uri is called
   *                                         to update the cache for this API. By default, it gets called every time, but if data rarely changes and
   *                                         it is an expensive API call, you have the option to return the cache and exit.
   * @return {Promise}      resolves with the loaded data; rejects with errors
   */
  getRequestData = (uri, args = {}) =>
    new Promise((resolve, reject) => {
      const headers = typeof args === 'object' ? args.headers : {};
      const headerParams = { ...this.headers, ...headers };
      const options = { ...args, headers: headerParams };
      const toHash = `${uri}-${headerParams.Authorization}`;
      const key = `graphql-${crypto
        .createHash('md5')
        .update(toHash)
        .digest('hex')}`;
      const hasCache = isCacheEnabled(this, options);

      if (hasCache) {
        new Promise(redisResolve => {
          getCached(this, key, redisResolve, reject);
        })
          .then(result => {
            if (!result) {
              //Not found in cache, proceed to make the request
              this.makeRequest(uri, options, key, resolve, reject);
              return;
            }
            if (options && options.cacheRefresh > 0) {
              //We have specified that we only want to refresh the cache conditionally, so we will check if it's time to do so
              refreshCache(this, uri, options, key);
              resolve(result); //Found in cache, resolve with cached result
              return;
            }
            this.makeRequest(uri, options, key, null, reject); //make request to refresh cache
            resolve(result); //Found in cache, resolve with cached result
          })
          .catch(err => {
            reject(err);
          });
      } else {
        this.makeRequest(uri, options, key, resolve, reject);
      }
    });

  /**
   * Loads an array of URIs
   * @param  {Array}   uris an array of URIs to request data from
   * @return {Promise}      the response from all requested URIs
   */
  load = uris => Promise.all(uris.map(this.getRequestData));

  /**
   * Configures and sends a GET request to a REST API endpoint.
   * @param  {string}  endpoint the API endpoint to send the request to
   * @param  {object}  options   optional configuration for the request
   * @return {Promise}          Promise that resolves with the request result
   */
  get(endpoint, options) {
    this.createLoader();

    // If additional options are needed, we bypass the dataloader
    if (options) {
      return this.getRequestData(
        `${options.overrideBaseUri || this.apiBaseUri}${endpoint}`,
        options,
      );
    }

    return this.loader.load(`${this.apiBaseUri}${endpoint}`);
  }

  /**
   * Helper method for sending non-cacheable requests.
   *
   * @see https://github.com/request/request-promise
   *
   * @param  {string}  endpoint  the API endpoint to hit
   * @param  {string}  method    the HTTP request method to use
   * @param  {object}  options   config options for request-promise
   * @return {Promise}           result of the request
   */
  mutation(endpoint, method, options) {
    // can't pass overrideBaseUri into the mutation config, so we extract it, delete it, then use it for the endpoint override
    const { overrideBaseUri } = options.body; // may or not exist depending on what's passed in
    delete options.body.overrideBaseUri; // won't do anything if it doesn't exist

    const config = {
      // Start with our baseline configuration.
      ...this.getRequestConfig(
        `${overrideBaseUri || this.apiBaseUri}${endpoint}`,
        options,
      ),
      // Add some PUT-specific options.
      method,
      // Allow the caller to override options.
      ...options,
    };
    return this.request(config);
  }

  /**
   * Configures the muation options to correctly set request headers
   * @param  {object} body     optional body to be sent with the request
   * @param  {object} options  optional configuration for request-promise
   * @return {object}          complete request-promise configuration
   */
  getMutationOptions(body, options) {
    const { formData } = options;

    // If there's formData, we omit the body to have the Content-Type header
    // for file uploads set automatically by request-promise
    if (formData) {
      return {
        ...options,
      };
    }

    // Otherwise, we return the body along with any other options
    return {
      body,
      ...options,
    };
  }

  /**
   * Configures and sends a POST request to a REST API endpoint.
   * @param  {string} endpoint the API endpoint to send the request to
   * @param  {object} body     optional body to be sent with the request
   * @param  {object} options  optional configuration for request-promise
   * @return {Promise}         Promise that resolves with the request result
   */
  post(endpoint, body = {}, options = {}) {
    const mutationOptions = this.getMutationOptions(body, options);

    return this.mutation(endpoint, 'POST', mutationOptions);
  }

  /**
   * Configures and sends a PUT request to a REST API endpoint.
   * @param  {string} endpoint the API endpoint to send the request to
   * @param  {object} body     optional body to be sent with the request
   * @param  {object} options  optional configuration for request-promise
   * @return {Promise}         Promise that resolves with the request result
   */
  put(endpoint, body = {}, options = {}) {
    const mutationOptions = this.getMutationOptions(body, options);

    return this.mutation(endpoint, 'PUT', mutationOptions);
  }

  /**
   * Configures and sends a PATCH request to a REST API endpoint.
   * @param  {string} endpoint the API endpoint to send the request to
   * @param  {object} body     optional body to be sent with the request
   * @param  {object} options  optional configuration for request-promise
   * @return {Promise}         Promise that resolves with the request result
   */
  patch(endpoint, body = {}, options = {}) {
    const mutationOptions = this.getMutationOptions(body, options);

    return this.mutation(endpoint, 'PATCH', mutationOptions);
  }

  /**
   * Configures and sends a DELETE request to a REST API endpoint.
   * @param  {string} endpoint the API endpoint to send the request to
   * @param  {object} options  optional configuration for request-promise
   * @return {Promise}         Promise that resolves with the request result
   */
  delete(endpoint, options = {}) {
    return this.mutation(endpoint, 'DELETE', {
      ...options,
    });
  }

  /**
   * Configures and sends a HEAD request to a REST API endpoint.
   * @param  {string} endpoint the API endpoint to send the request to
   * @param  {object} options  optional configuration for request-promise
   * @return {Promise}         Promise that resolves with the request result
   */
  head(endpoint, options = {}) {
    return this.mutation(endpoint, 'HEAD', {
      ...options,
    });
  }

  createLoader() {
    // We can enable batched queries later on, which may be more performant.
    this.loader = new DataLoader(this.load, {
      batch: false,
    });
  }
}
