const path = require('path');
const TerserPlugin = require('terser-webpack-plugin');
const CopyPlugin = require('copy-webpack-plugin');

module.exports = {
  entry: {
    background: './background.js',
    content: './content.js',
    popup: './popup.js'
  },
  output: {
    filename: '[name].js',
    path: path.resolve(__dirname, 'dist'),
    clean: true
  },
  optimization: {
    minimize: true,
    minimizer: [new TerserPlugin({
      terserOptions: {
        format: {
          comments: false,
        },
        compress: {
          drop_console: false, // Keep console.logs for debug mode
          drop_debugger: true
        }
      },
      extractComments: false
    })],
  },
  plugins: [
    new CopyPlugin({
      patterns: [
        { 
          from: "manifest.json",
          to: "manifest.json",
          transform(content) {
            // Remove comments and minimize JSON
            return JSON.stringify(JSON.parse(content));
          },
        },
        { from: "popup.html", to: "popup.html" },
        { from: "images", to: "images" },
        // Add any other static assets that need to be copied
      ],
    }),
  ],
};