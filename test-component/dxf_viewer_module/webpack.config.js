const path = require("path");
const { VueLoaderPlugin } = require("vue-loader");

module.exports = {
  entry: "./assets/js/index.js",
  output: {
    filename: "index.js",
    path: path.resolve(__dirname, "dist/js/"),
  },
  optimization: {
    minimize: false,
  },
  watchOptions: {
    ignored: ["**/dist/**", "**/node_modules"],
  },
  devServer: {
    hot: true,
    port: 8080,
    open: {
      target: ["first.html", "http://localhost:8080/"],
      app: {
        name: "google-chrome",
        arguments: ["--incognito", "--new-window"],
      },
    },
  },
  module: {
    rules: [
      {
        test: /\.vue$/,
        loader: "vue-loader",
      },
      // this will apply to both plain `.js` files
      // AND `<script>` blocks in `.vue` files
      // {
      //   test: /\.js$/,
      //   loader: 'babel-loader'
      // },
      {
        test: /\.css$/,
        use: [
          // [style-loader](/loaders/style-loader)
          { loader: "style-loader" },
          // [css-loader](/loaders/css-loader)
          {
            loader: "css-loader",
            // options: {
            //   modules: false,
            // },
          },
          // [sass-loader](/loaders/sass-loader)
          { loader: "sass-loader" },
        ],
      },
    ],
  },
  plugins: [
    // make sure to include the plugin for the magic
    new VueLoaderPlugin(),
  ],
};
