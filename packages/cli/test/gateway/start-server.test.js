import startServer from '../../src/gateway/start-server';
import * as logger from '../../src/lib/logger';

console.log = jest.fn();
const mockApp = { listen: jest.fn((port, cb) => cb()) };

describe('gateway/start-server', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('starts the default gateway when no config is passed', async () => {
    const successSpy = jest.spyOn(logger, 'success');

    await startServer(mockApp);

    expect(console.log).toHaveBeenCalled();
    expect(successSpy).toHaveBeenCalledWith(
      expect.arrayContaining([
        '  A GraphQL gateway has successfully started using live data.',
      ]),
    );
  });

  it('starts the default gateway in mock mode if the flag is set', async () => {
    const successSpy = jest.spyOn(logger, 'success');

    await startServer(mockApp, { enableMockData: true });

    expect(successSpy).toHaveBeenCalledWith(
      expect.arrayContaining([
        '  A GraphQL gateway has successfully started using mock data.',
      ]),
    );
  });

  it('lists local data sources when present', async () => {
    const successSpy = jest.spyOn(logger, 'success');

    await startServer(mockApp, {
      dataSources: [{ namespace: 'TestOne' }, { namespace: 'TestTwo' }],
    });

    expect(successSpy).toHaveBeenCalledWith(
      expect.arrayContaining([expect.stringMatching(/TestOne/)]),
    );
    expect(successSpy).toHaveBeenCalledWith(
      expect.arrayContaining([expect.stringMatching(/TestTwo/)]),
    );
  });
});
