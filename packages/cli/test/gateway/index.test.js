import Express from 'express';

import startDefaultGateway from '../../src/gateway';
import configureApp from '../../src/gateway/configure-app';
import startServer from '../../src/gateway/start-server';

jest.mock('express', () => jest.fn());
jest.mock('../../src/gateway/configure-app.js', () =>
  jest.fn(() => 'TEST APP'),
);
jest.mock('../../src/gateway/start-server.js', () => jest.fn());

describe('gateway', () => {
  it('starts the default gateway', () => {
    startDefaultGateway({ dataSources: [] });

    expect(configureApp).toHaveBeenCalledWith(Express(), { dataSources: [] });
    expect(startServer).toHaveBeenCalledWith('TEST APP', { dataSources: [] });
  });
});
