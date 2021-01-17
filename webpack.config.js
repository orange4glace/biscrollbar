const path = require('path');
const nodeExternals = require('webpack-node-externals');

const opts = {
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: 'ts-loader',
        exclude: /node_modules/,
      },
      {
        test: /\.s[ac]ss$/i,
        use: [
          // Creates `style` nodes from JS strings
          "style-loader",
          // Translates CSS into CommonJS
          "css-loader",
          // Compiles Sass to CSS
          "sass-loader",
        ],
      },
    ]
  },
  resolve: {
    extensions: [ '.tsx', '.ts', '.js', 'css', 'scss' ],
    alias: {
      root: __dirname,
      lib: path.resolve(__dirname, 'lib'),
    },
  },
  devtool: 'source-map',
}

module.exports = [
  {
    ...opts,
    entry: './lib/index.default.ts',
    output: {
      filename: 'biscrollbar.min.js',
      path: path.resolve(__dirname, 'dist'),
      library: 'BiScrollbar',
      libraryExport: 'default',
      libraryTarget: 'window'
    }
  },
  {
    ...opts,
    entry: './lib/index.ts',
    externals: [nodeExternals()],
    output: {
      filename: 'index.js',
      path: path.resolve(__dirname, 'dist'),
      library: 'BiScrollbar',
      libraryTarget: 'umd'
    }
  }
]