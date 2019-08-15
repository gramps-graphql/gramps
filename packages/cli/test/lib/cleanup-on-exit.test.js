import cleanup from 'node-cleanup';
import * as dataSources from '../../src/lib/data-sources';
import * as logger from '../../src/lib/logger';
import cleanupOnExit from '../../src/lib/cleanup-on-exit';

dataSources.cleanUpTempDir = jest.fn();
logger.success = jest.fn();
process.kill = jest.fn();

jest.mock('node-cleanup', () => ({
  uninstall: jest.fn(),
}));

describe('lib/cleanup-on-exit', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('removes the temporary dir and kills the process', () => {
    dataSources.cleanUpTempDir.mockImplementationOnce(() => false);

    cleanupOnExit(null, 'TEST');

    expect(dataSources.cleanUpTempDir).toBeCalled();
    expect(logger.success).not.toBeCalled();
    expect(cleanup.uninstall).toBeCalled();
    expect(process.kill).toBeCalledWith(process.pid, 'TEST');
  });

  it('logs a message if the flag is set', () => {
    dataSources.cleanUpTempDir.mockImplementationOnce(() => true);

    cleanupOnExit(null, 'TEST');

    expect(logger.success).toBeCalledWith(
      expect.stringMatching(/Successfully shut down./),
    );
  });
});
