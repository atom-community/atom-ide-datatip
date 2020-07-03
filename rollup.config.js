import resolve from "@rollup/plugin-node-resolve";
import commonjs from "@rollup/plugin-commonjs";

import babel from "rollup-plugin-babel";
// import typescript from '@rollup/plugin-typescript';

import { terser } from "rollup-plugin-terser";

let plugins = [
  // // so Rollup can convert TypeScript to JavaScript
  // typescript({
  //   noEmitOnError: false,
  // }),

  // if any (in deps as well): Convert CoffeeScript to JavaScript
  // coffeescript(),

  // // so Rollup can bundle JSON to JavaScript
  // json(
  //   { compact: true }
  // ),

  babel(),

  // so Rollup can find externals
  resolve({ extensions: ["ts", ".js", ".coffee"], preferBuiltins: true }),

  // so Rollup can convert externals to an ES module
  commonjs(),
];

// minify only in production mode
if (process.env.NODE_ENV === "production") {
  plugins.push(
    // minify
    terser({
      ecma: 2018,
      warnings: true,
      compress: {
        drop_console: true,
      },
    })
  );
}

export default [
  {
    input: "lib/main.js",
    output: [
      {
        dir: "dist",
        format: "cjs",
        sourcemap: true,
      },
    ],
    // loaded externally
    external: ["atom"],
    plugins: plugins,
  },
];
