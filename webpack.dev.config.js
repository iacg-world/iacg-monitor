const path = require('path')
const HtmlWebpackPlugin = require('html-webpack-plugin')

module.exports = {
  mode: 'development',
  entry: {
    'iacg-monitor': path.resolve(__dirname, './src/index.js'),
  },
  output: {
    filename: '[name].js',
    path: path.resolve(__dirname, './dist'),
    clean: true,
  },
  devServer: {
    static: {
      directory: path.resolve(__dirname, './dist'),
    },
    compress: true,
    port: 9000,
    hot: true,
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
