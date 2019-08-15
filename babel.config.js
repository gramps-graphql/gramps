module.exports = {
  presets: [
    [
      '@babel/preset-env',
      {
        targets: {
          node: 'current',
        },
      },
    ],
  ],
  plugins: [
    'babel-plugin-inline-import',
    '@babel/plugin-proposal-class-properties',
  ],
};
