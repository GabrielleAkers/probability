const path = require("path");

module.exports = {
  entry: {
    app: "./out/app.mjs"
  },
  output: {
    path: path.resolve(__dirname, "dist"),
    filename: "app.bundle.js",
  },
  optimization: {
    usedExports: true
  },
  watch: true,
  cache: true
};
