import { defineConfig } from "tsup";

export default defineConfig({
  entry: ["src/index.ts", "src/styles/default.css"],
  format: ["cjs", "esm"],
  dts: true,
  sourcemap: true,
  clean: true,
  external: ["react", "react-dom"],
  injectStyle: false,
  minify: true,
});
