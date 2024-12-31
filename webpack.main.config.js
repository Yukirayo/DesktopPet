const path = require('path')

module.exports = {
  /**
   * This is the main entry point for your application, it's the first file
   * that runs in the main process.
   */
  entry: './src/main.js',
  // Put your normal webpack config below here
  module: {
    rules: require('./webpack.rules'),
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
