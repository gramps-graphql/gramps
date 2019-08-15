import yargs from 'yargs';
import * as dev from '../src/dev';

jest.mock('yargs', () => ({
  command: jest.fn(() => ({
    demandCommand: jest.fn(() => ({ help: jest.fn(() => ({ argv: '' })) })),
  })),
}));

describe('gramps', () => {
  test('it registers the dev command', () => {
    const spy = jest.spyOn(yargs, 'command');

    // eslint-disable-next-line global-require
    require('../src/gramps');

    expect(spy).toBeCalledWith(dev);
  });
});
