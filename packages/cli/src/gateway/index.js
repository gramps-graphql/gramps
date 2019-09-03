import Express from 'express';

import configureApp from './configure-app';
import startServer from './start-server';

import { loadDataSources } from '../lib/data-sources';

const enableMockData = process.env.GRAMPS_MODE !== 'live';
const dataSources = loadDataSources(
  process.env.GRAMPS_LOCAL_DATA_SOURCE_PATHS.split(','),
);

const startDefaultGateway = async () => {
  const config = { dataSources, enableMockData };

  const app = await configureApp(Express(), config);

  return startServer(app, config);
};

startDefaultGateway();

export default startDefaultGateway;
