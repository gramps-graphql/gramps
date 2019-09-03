import Express from 'express';

import configureApp from '../../src/gateway/configure-app';
import startServer from '../../src/gateway/start-server';

jest.mock('express', () => jest.fn());
jest.mock('../../src/gateway/configure-app.js', () =>
  jest.fn(() => 'TEST APP'),
);
jest.mock('../../src/gateway/start-server.js', () => jest.fn());

describe('gateway', () => {
  it('starts the default gateway', async () => {
    expect.assertions(2);

    process.env.GRAMPS_MODE = 'live';

    process.env.GRAMPS_LOCAL_DATA_SOURCE_PATHS =
      '/Users/somebody/dev/my-data-source';

    const startDefaultGateway = require('../../src/gateway').default; // eslint-disable-line global-require

    await startDefaultGateway();

    expect(configureApp).toHaveBeenCalledWith(Express(), {
      dataSources: [],
      enableMockData: false,
    });
    expect(startServer).toHaveBeenCalledWith('TEST APP', {
      dataSources: [],
      enableMockData: false,
    });
  });
});
