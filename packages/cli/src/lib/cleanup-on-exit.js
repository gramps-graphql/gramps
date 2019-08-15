import cleanup from 'node-cleanup';
import { cleanUpTempDir } from './data-sources';
import { success } from './logger';

export default (_, signal) => {
  // Uninstall the handler to prevent an infinite loop.
  cleanup.uninstall();

  // Delete the temporary directory.
  const shouldPrintShutdownMessage = cleanUpTempDir();

  if (shouldPrintShutdownMessage) {
    success('Successfully shut down. Thanks for using GrAMPS!');
  }

  process.kill(process.pid, signal);

  return false;
};
