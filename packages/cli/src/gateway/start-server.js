import getPort from 'get-port';

import { success } from '../lib/logger';
import { DEFAULT_PORT, GRAPHQL_ENDPOINT, TESTING_ENDPOINT } from '.';

export default async function startServer(
  app,
  { enableMockData, dataSources = [] } = {},
) {
  const PORT = await getPort(DEFAULT_PORT);
  app.listen(PORT, () => {
    const mode = enableMockData ? 'mock' : 'live';
    success([
      '='.repeat(65),
      '',
      `  A GraphQL gateway has successfully started using ${mode} data.`,
      ``,
      `  The following GrAMPS data sources are running locally:`,
      ...dataSources.map(src => `    - ${src.namespace}`),
      ``,
      `  For UI development, point your GraphQL client to:`,
      `    http://localhost:${PORT}${GRAPHQL_ENDPOINT}`,
      ``,
      `  To test your data sources in the GraphQL Playground, visit:`,
      `    http://localhost:${PORT}${TESTING_ENDPOINT}`,
      ``,
      '  To stop this gateway, press `control` + `C`.',
      ``,
      '='.repeat(65),
    ]);
  });
}
