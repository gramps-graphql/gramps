#!/usr/bin/env node

import yargs from 'yargs';
import * as dev from './dev';

yargs
  .command(dev)
  .demandCommand()
  .help().argv;
