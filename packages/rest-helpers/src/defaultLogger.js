/* eslint-disable no-console */
const time = () => `[${new Date().toISOString()}]`;
export default {
  info: msg => console.info(time(), msg),
  warn: msg => console.warn(time(), msg),
  error: msg => console.error(time(), msg),
};
