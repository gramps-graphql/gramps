import path from 'path';
import * as crossSpawn from 'cross-spawn';
import * as dev from '../src/dev';
import startDefaultGateway from '../src/gateway';
import * as dataSources from '../src/lib/data-sources';
import mockYargsImplementation from './fixtures/mock-yargs';

jest.mock('cross-spawn', () => ({ spawn: jest.fn() }));
jest.mock('../src/gateway', () => jest.fn());
jest.mock('../src/lib/data-sources.js', () => ({
  loadDataSources: jest.fn(),
  transpileDataSources: jest.fn(),
  cleanUpTempDir: jest.fn(),
}));

console.warn = jest.fn();

describe('gramps dev', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('has the correct exports for a yargs command', () => {
    expect(dev.command).toEqual('dev');
    expect(dev.description).toEqual(expect.any(String));
    expect(dev.builder).toEqual(expect.any(Function));
    expect(dev.handler).toEqual(expect.any(Function));
  });

  describe('builder', () => {
    it('exposes the correct options', () => {
      const yargs = mockYargsImplementation();
      dev.builder(yargs);

      expect(yargs.option).toBeCalledWith('data-source', expect.any(Object));
      expect(yargs.option).toBeCalledWith('gateway', expect.any(Object));
      expect(yargs.option).toBeCalledWith('transpile', expect.any(Object));
      expect(yargs.options).toBeCalledWith(
        expect.objectContaining({
          live: expect.any(Object),
          mock: expect.any(Object),
        }),
      );
    });

    it('properly coerces relative paths into absolute paths', () => {
      const mockYargs = mockYargsImplementation();
      dev.builder(mockYargs);

      expect(mockYargs.callbacks.d(['../fixtures/data-source-one'])).toEqual([
        path.resolve(process.cwd(), '../fixtures/data-source-one'),
      ]);
    });

    it('properly coerces the gateway path into an absolute path', () => {
      const mockYargs = mockYargsImplementation();
      dev.builder(mockYargs);

      expect(mockYargs.callbacks.g('../../gateway/index.js')).toEqual(
        path.resolve(process.cwd(), '../../gateway/index.js'),
      );
    });
  });

  describe('handler', () => {
    it('logs a warning about the CLI being dev-only', () => {
      dev.handler({});

      expect(console.warn).toBeCalledWith(
        expect.stringMatching(
          /The GrAMPS CLI is intended for local development only./,
        ),
      );
    });

    it('starts the default gateway with no arguments', () => {
      dev.handler({});

      expect(startDefaultGateway).toBeCalledWith(
        expect.objectContaining({
          dataSources: expect.any(Array),
          enableMockData: expect.any(Boolean),
        }),
      );
    });

    it('starts a custom gateway if one is provided', async () => {
      await dev.handler({ gateway: './gateway.js' });

      expect(process.env.GRAMPS_MODE).toEqual('live');
      expect(process.env.GRAMPS_DATA_SOURCES).toEqual('');
      expect(crossSpawn.spawn).toBeCalledWith('node', ['./gateway.js'], {
        stdio: 'inherit',
      });
    });

    it('starts a custom gateway in mock mode when flag is set', async () => {
      await dev.handler({ gateway: './gateway.js', mock: true });

      expect(process.env.GRAMPS_MODE).toEqual('mock');
    });

    it('starts a custom gateway with data source overrides if set', async () => {
      dataSources.transpileDataSources.mockImplementationOnce(
        (_, pathArr) => pathArr,
      );
      await dev.handler({
        gateway: './gateway.js',
        dataSources: ['./one', './two'],
      });

      expect(process.env.GRAMPS_DATA_SOURCES).toEqual('./one,./two');
    });

    it('transpiles and loads data sources if provided', async () => {
      await dev.handler({ dataSources: ['./one', './two'] });

      expect(dataSources.transpileDataSources).toBeCalledWith(undefined, [
        './one',
        './two',
      ]);
      expect(dataSources.loadDataSources).toBeCalled();
    });

    it('logs an error and exits if loading data sources fails', async () => {
      console.error = jest.fn();
      process.exit = jest.fn();

      dataSources.loadDataSources.mockImplementationOnce(() => {
        throw Error('test error');
      });

      await dev.handler({ dataSources: ['./one'] });
      expect(console.error).toBeCalledWith(expect.any(Error));
      expect(dataSources.cleanUpTempDir).toBeCalled();
      expect(process.exit).toBeCalledWith(2);
    });
  });
});
