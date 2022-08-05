const MonacoWebpackPlugin = require("monaco-editor-webpack-plugin");
const nextTranspileModules = require("next-transpile-modules");
const withTM = nextTranspileModules(["monaco-editor", "@onflow/flow-cadut"]);

module.exports = withTM({
    reactStrictMode: true,
    outputFileTracing: false,
    webpack: (config) => {
        config.resolve.alias["vscode"] = require.resolve(
            "monaco-languageclient/lib/vscode-compatibility"
        );

        config.plugins.push(
            new MonacoWebpackPlugin({
                languages: ["json"],
                features: [],
                filename: "static/[name].worker.js",
            })
        );
        return config;
    },
});
