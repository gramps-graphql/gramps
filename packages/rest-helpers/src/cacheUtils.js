const REFRESH_CACHE_PREFIX_KEY = 'REFRESH_CACHE_';

const getCustomCacheOptions = (connector, options) => {
  let expiry = connector.cacheExpiry;
  let setCustomRefresh = false;
  let setCache = true;
  if (options.cacheExpiry === 0) {
    setCache = false;
  } else if (options.cacheExpiry > 0) {
    expiry = options.cacheExpiry;
  }
  if (options.cacheRefresh > 0) {
    setCustomRefresh = options.cacheRefresh;
  }
  return { expiry, setCustomRefresh, setCache };
};

/**
 * Stores given data in the cache for a set amount of time.
 * @param  {string} key      an MD5 hash of the request URI
 * @param  {object} response the data to be cached
 * @return {object}          the response, unchanged
 */
export const addToCache = (connector, key, uri, options, response) => {
  if (!connector.enableCache) {
    return;
  }
  const { expiry, setCustomRefresh, setCache } = getCustomCacheOptions(
    connector,
    options,
  );
  if (setCache === false) {
    return; //cache is set to 0, so do not store to cache
  }
  if (setCustomRefresh !== false) {
    //Custom refresh is set to true, save a redix key that indicates while present we do not want to call the api and refresh cache
    connector.redis.setex(
      `${REFRESH_CACHE_PREFIX_KEY}${key}`,
      setCustomRefresh,
      'true',
    );
  }
  connector.logger.info(
    `caching response data for ${uri} for ${expiry} seconds`,
  );
  connector.redis.setex(key, expiry, JSON.stringify(response));
};

const returnData = (successCB, data) => {
  // The success callback will typically resolve a Promise.
  try {
    successCB(JSON.parse(data));
  } catch (e) {
    //if for some reason there was a network error and the string saved was truncated (not a proper JSON object) then the parse
    //will fail, so in that case, just return null so that we force the api to refresh the cache with good data.
    successCB(null);
  }
};

/**
 * Loads data from the cache, if available.
 * @param  {string}   key       the cache identifier key
 * @param  {function} successCB typically a Promise's `resolve` function
 * @param  {function} errorCB   typically a Promise's `reject` function
 * @return {boolean}            true if cached data was found, false otherwise
 */
export const getCached = (connector, key, successCB, errorCB) => {
  connector.redis.get(key, (error, data) => {
    if (error) {
      errorCB(error);
    }

    // If we have data, initiate a refetch in the background and return it.
    if (data !== null) {
      connector.logger.info('loading data from cache');
      returnData(successCB, data);
    } else {
      successCB(null);
    }
  });
};

export const isCacheEnabled = (connector, options) => {
  if (!connector.redis || !connector.enableCache) {
    return false;
  }
  if (options && options.cacheExpiry === 0) {
    return false;
  }
  return true;
};

export const refreshCache = (connector, uri, options, key) => {
  connector.redis.get(`${REFRESH_CACHE_PREFIX_KEY}${key}`, (error, data) => {
    if (data !== 'true') {
      //Key expired, means it's time to refresh cache;
      connector.makeRequest(uri, options, key);
    }
  });
};

export default { addToCache, isCacheEnabled, getCached, refreshCache };
