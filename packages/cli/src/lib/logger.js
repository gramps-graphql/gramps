import { EOL } from 'os';
import chalk from 'chalk';

const padMsg = msg =>
  ['']
    .concat(msg)
    .concat('')
    .join(EOL);

export const error = msg => console.error(chalk.red.bold(padMsg(msg)));
export const log = msg => console.log(chalk.dim(msg));
export const success = msg => console.log(chalk.green(padMsg(msg)));
export const warn = msg => console.warn(chalk.yellow.bold(padMsg(msg)));
