const MonacoWebpackPlugin = require("monaco-editor-webpack-plugin")
const nextTranspileModules = require("next-transpile-modules")
const withTM = nextTranspileModules(["monaco-editor", "flow-cadut"])

module.exports = withTM({
  reactStrictMode: true,
  webpack: (config, { buildId, dev, isServer, defaultLoaders, webpack }) => {
    config.plugins.push(
      new MonacoWebpackPlugin({
        languages: ["json"],
        features: [],
        filename: "static/[name].worker.js",
      })
    )
    return config
  }
})