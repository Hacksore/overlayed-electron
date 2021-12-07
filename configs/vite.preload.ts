import { join } from "path";
import { builtinModules } from "module";
import { defineConfig } from "vite";
import { nodeResolve } from "@rollup/plugin-node-resolve";

export default defineConfig({
  mode: process.env.NODE_ENV,
  root: join(__dirname, "../src/preload"),
  build: {
    outDir: "../../dist/preload",
    lib: {
      entry: "index.ts",
      formats: ["cjs"],
    },
    sourcemap: false,
    minify: false,
    emptyOutDir: true,
    rollupOptions: {
      external: [...builtinModules, "electron"],
      plugins: [
        nodeResolve({
          preferBuiltins: false,
        }),
      ],
      output: {
        entryFileNames: "[name].cjs",
      },
    },
  },
});
