import { createPlugins } from "rollup-plugin-atomic"

const plugins = createPlugins([["babel", { extensions: [".ts", ".tsx"] }, true], "js", "json"])

const RollupConfig = [
  {
    input: "lib/main.ts",
    output: [
      {
        dir: "dist",
        format: "cjs",
        sourcemap: process.env.NODE_ENV === "development" ? "inline" : true,
      },
    ],
    // loaded externally
    external: ["atom"],
    plugins,
  },
]
export default RollupConfig
