const CopyPlugin = require("copy-webpack-plugin");
const MonacoWebpackPlugin = require("monaco-editor-webpack-plugin");
const nextTranspileModules = require("next-transpile-modules");
const path = require("path");
const withTM = nextTranspileModules(["monaco-editor", "flow-cadut"]);

module.exports = withTM({
  reactStrictMode: true,
  webpack: (config, { buildId, dev, isServer, defaultLoaders, webpack }) => {
    config.plugins.push(
      new MonacoWebpackPlugin({
        languages: ["json"],
        features: [],
        filename: "static/[name].worker.js",
      })
    );
    config.plugins.push(
      new CopyPlugin({
        patterns: [
          {
            from: "node_modules/@onflow/cadence-language-server/dist/cadence-language-server.wasm",
            to: "public/cadence-language-server.wasm",
          },
        ],
      })
    );
    return config;
  },
});
