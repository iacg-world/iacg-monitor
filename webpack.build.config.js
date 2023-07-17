const path = require('path')
const HtmlWebpackPlugin = require('html-webpack-plugin')

module.exports = {
  mode: 'production',
  entry: {
    'iacg-monitor': path.resolve(__dirname, './src/index.js'),
  },
  output: {
    filename: '[name].js',
    path: path.resolve(__dirname, './dist'),
    clean: true,
  },
  plugins: [
    new HtmlWebpackPlugin({
      filename: 'index.html',
      template: path.resolve(__dirname, './examples/index.html'),
      chunks: ['iacg-monitor'],
      scriptLoading: 'blocking',
      inject: 'head',
    }),
  ],
}
