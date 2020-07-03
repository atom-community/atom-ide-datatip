let presets = ["@babel/preset-react"];

let plugins =  [
  // "transform-react-remove-prop-types",
  // "@babel/plugin-syntax-dynamic-import",
  // '@babel/plugin-proposal-optional-chaining',
  // '@babel/plugin-proposal-class-properties'
  ];

if (process.env.BABEL_ENV === "development") {
  plugins.push("@babel/plugin-transform-modules-commonjs")
}

module.exports = {
  presets: presets,
  plugins: plugins,
  exclude: "node_modules/**",
  // runtimeHelpers: true,
}
