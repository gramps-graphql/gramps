import path from 'path';
import cleanup from 'node-cleanup';
import nodemon from 'nodemon';

import {
  loadDataSources,
  transpileDataSources,
  cleanUpTempDir,
} from './lib/data-sources';
import cleanupOnExit from './lib/cleanup-on-exit';
import { warn } from './lib/logger';

const getDirPath = dir => path.resolve(process.cwd(), dir);

const prepareDataSources = async (transpile, dataSources) => {
  let dataSourcePaths = [];
  let loadedDataSources = [];

  if (dataSources.length) {
    try {
      // Get an array of paths to the local data sources.
      dataSourcePaths = await transpileDataSources(transpile, dataSources);
      loadedDataSources = loadDataSources(dataSourcePaths);
    } catch (error) {
      // If something went wrong loading data sources, log it, tidy up, and die.
      console.error(error);
      await cleanUpTempDir();
      process.exit(2); // eslint-disable-line no-process-exit
    }
  }

  process.env.GRAMPS_LOCAL_DATA_SOURCE_PATHS =
    dataSourcePaths && dataSourcePaths.length ? dataSourcePaths.join(',') : '';

  return {
    dataSourcePaths,
    loadedDataSources,
  };
};

const spawnNodemon = ({ script, transpile, dataSources }) => {
  nodemon({ script, ext: 'js json graphql' })
    .on('quit', () => {
      process.exit(2); // eslint-disable-line no-process-exit
    })
    .on('restart', async () => {
      await prepareDataSources(transpile, dataSources);
    });
};

const startGateway = ({
  mock,
  gateway,
  dataSources,
  transpile,
  dataSourcePaths,
}) => {
  process.env.GRAMPS_MODE = mock ? 'mock' : 'live';

  // If a custom gateway was specified, set the env vars and start it.
  if (gateway) {
    // Define GrAMPS env vars.
    process.env.GRAMPS_DATA_SOURCES = dataSourcePaths.length
      ? dataSourcePaths.join(',')
      : '';

    // Start the user-specified gateway.
    spawnNodemon({ script: gateway, transpile, dataSources });

    return;
  }

  // If we get here, fire up the default gateway for development.
  const defaultGatewayPath = path.resolve(__dirname, 'gateway');

  spawnNodemon({ script: defaultGatewayPath, transpile, dataSources });
};

export const command = 'dev';
export const description = 'run a GraphQL gateway for local development';

export const builder = yargs =>
  yargs
    .group(['data-source'], 'Choose data source(s) for local development:')
    .option('data-source', {
      alias: ['data-sources', 'd'],
      description: 'path to one or more data sources',
      type: 'array',
    })
    .group(['gateway'], 'Choose a GraphQL gateway to run the data sources:')
    .option('gateway', {
      alias: 'g',
      description: 'path to a GraphQL gateway start script',
      type: 'string',
    })
    .coerce('d', srcArr => srcArr.map(getDirPath))
    .coerce('g', getDirPath)
    .group(['live', 'mock'], 'Choose real or mock data:')
    .options({
      live: {
        alias: 'l',
        conflicts: 'mock',
        description: 'run GraphQL with live data',
      },
      mock: {
        alias: 'm',
        conflicts: 'live',
        description: 'run GraphQL offline with mock data',
      },
    })
    .group(
      ['transpile', 'no-transpile'],
      'Choose whether to transpile data sources with Babel:',
    )
    .option('transpile', {
      type: 'boolean',
      default: true,
    });

export const handler = async ({
  dataSources = [],
  mock = false,
  gateway,
  transpile,
}) => {
  warn('The GrAMPS CLI is intended for local development only.');

  const { dataSourcePaths } = await prepareDataSources(transpile, dataSources);

  startGateway({
    mock,
    gateway,
    dataSources,
    transpile,
    dataSourcePaths,
  });
};

cleanup(cleanupOnExit);
