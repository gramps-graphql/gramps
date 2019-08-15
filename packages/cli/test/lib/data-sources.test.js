import path from 'path';
import {
  handleError,
  loadDataSources,
  transpileDataSources,
  cleanUpTempDir,
} from '../../src/lib/data-sources';
import * as logger from '../../src/lib/logger';

jest.mock('@babel/core', () => ({
  transformFileSync: () => ({ code: `var foo = 'bar';` }),
}));

describe('lib/data-sources', () => {
  beforeAll(() => {
    console.log = jest.fn();
  });

  describe('cleanupTempDir()', () => {
    it('returns a Promise resolved with `false` if no temp dir exists', async () => {
      // Run it twice to make sure there’s no temp dir.
      await cleanUpTempDir();
      const result = await cleanUpTempDir();

      return expect(result).toBe(false);
    });
  });

  describe('handleError()', () => {
    it('does nothing if there’s no error', () => {
      expect(() => handleError()).not.toThrow();
    });

    it('logs an error message if one is supplied', () => {
      console.error = jest.fn();
      const spy = jest.spyOn(logger, 'error');

      expect(() => handleError(new Error(), 'testing')).toThrowError();
      expect(spy).toHaveBeenCalledWith(expect.stringMatching(/testing/));
      expect(console.error).toHaveBeenCalled();
    });

    it('logs the error itself if no message is provided', () => {
      console.error = jest.fn();
      const spy = jest.spyOn(logger, 'error');

      expect(() => handleError('test error')).toThrowError();
      expect(spy).toHaveBeenCalledWith(expect.stringMatching(/test error/));
      expect(console.error).toHaveBeenCalled();
    });

    it('fires a callback instead of throwing if one is provided', () => {
      console.error = jest.fn();
      const spy = jest.spyOn(logger, 'error');
      const callback = jest.fn();

      expect(() => handleError('err', 'msg', callback)).not.toThrowError();
      expect(callback).toHaveBeenCalledWith('err');
      expect(console.error).toHaveBeenCalled();
    });
  });

  describe('loadDataSources()', () => {
    it('loads a single data source', () => {
      const dirPath = path.resolve(__dirname, '../fixtures/data-source-one');
      expect(loadDataSources([dirPath])[0]).toEqual(
        expect.objectContaining({
          namespace: 'DataSourceOne',
        }),
      );
    });

    it('loads multiple data sources', () => {
      const esPath = path.resolve(__dirname, '../fixtures/data-source-one');
      const cjsPath = path.resolve(__dirname, '../fixtures/data-source-cjs');

      const dataSources = loadDataSources([esPath, cjsPath]);

      expect(dataSources).toHaveLength(2);
      expect(dataSources[1].namespace).toEqual('DataSourceCJS');
    });

    it('warns on invalid data sources', () => {
      console.warn = jest.fn();

      loadDataSources(['./bad/path']);

      expect(console.warn).toHaveBeenCalledWith(
        expect.stringMatching(/Could not load a data source from/),
      );
    });

    it('warns if the data source is missing required properties', () => {
      console.error = jest.fn();

      const loadInvalidDataSource = () =>
        loadDataSources([
          path.resolve(__dirname, '../fixtures/data-source-invalid'),
        ]);

      expect(loadInvalidDataSource).toThrowError('Invalid data source.');
      expect(console.error).toHaveBeenCalledWith(
        expect.stringMatching(/data source .*? is missing required properties/),
      );
    });
  });

  describe('transpileDataSources()', () => {
    it('returns the path of transpiled data source(s)', async () => {
      const dataSources = await transpileDataSources(true, [
        path.resolve(__dirname, '../fixtures/data-source-one'),
      ]);

      return expect(dataSources).toEqual([
        path.resolve(process.cwd(), 'packages/cli/src/.tmp/data-source-one'),
      ]);
    });

    it('returns the original path if `--no-transpile` is set', async () => {
      const cjsPath = path.resolve(__dirname, '../fixtures/data-source-cjs');
      const dataSources = await transpileDataSources(false, [cjsPath]);

      return expect(dataSources).toEqual([cjsPath]);
    });

    it('ignores invalid data sources', async () => {
      const dataSources = await transpileDataSources(true, [
        path.resolve(__dirname, './not/a/thing'),
      ]);

      return expect(dataSources).toEqual([]);
    });
  });
});
