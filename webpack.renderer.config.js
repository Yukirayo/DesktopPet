const rules = require('./webpack.rules');
const path = require('node:path')
rules.push({
  test: /\.css$/,
  use: [{ loader: 'style-loader' }, { loader: 'css-loader' }],
});

module.exports = {
  // Put your normal webpack config below here
  module: {
    rules,
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
      '@image': path.resolve(__dirname, 'src/image'),
      '@spine': path.resolve(__dirname, 'src/spine'),
      '@tools': path.resolve(__dirname, 'src/tools'),
      '@data': path.resolve(__dirname, 'data'),
    },
    extensions: ['.js', '.jsx', '.ts', '.tsx', '.json', 'mjs']
  },
};
