import chalk from 'chalk';
import * as logger from '../../src/lib/logger';

jest.mock('chalk', () => ({
  bold: jest.fn(),
  dim: jest.fn(),
  green: jest.fn(),
  red: { bold: jest.fn() },
  yellow: { bold: jest.fn() },
}));

describe('lib/logger', () => {
  beforeAll(() => {
    console.log = jest.fn();
    console.warn = jest.fn();
    console.error = jest.fn();
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('error()', () => {
    it('logs a red, bolded message when called', () => {
      const boldSpy = jest.spyOn(chalk.red, 'bold');
      const logSpy = jest.spyOn(console, 'error');

      logger.error('error');

      expect(boldSpy).toHaveBeenCalledWith(expect.stringMatching(/error/));
      expect(logSpy).toHaveBeenCalled();
    });
  });

  describe('log()', () => {
    it('logs a dimmed message when called', () => {
      const dimSpy = jest.spyOn(chalk, 'dim');
      const logSpy = jest.spyOn(console, 'log');

      logger.log('log');

      expect(dimSpy).toHaveBeenCalledWith(expect.stringMatching(/log/));
      expect(logSpy).toHaveBeenCalled();
    });
  });

  describe('success()', () => {
    it('prints a green message when called', () => {
      const greenSpy = jest.spyOn(chalk, 'green');
      const logSpy = jest.spyOn(console, 'log');

      logger.success('success');

      expect(greenSpy).toHaveBeenCalledWith(expect.stringMatching(/success/));
      expect(logSpy).toHaveBeenCalled();
    });
  });

  describe('warn()', () => {
    it('logs a yellow, bolded message when called', () => {
      const boldSpy = jest.spyOn(chalk.yellow, 'bold');
      const logSpy = jest.spyOn(console, 'warn');

      logger.warn('warning');

      expect(boldSpy).toHaveBeenCalledWith(expect.stringMatching(/warning/));
      expect(logSpy).toHaveBeenCalled();
    });
  });
});
