import { join } from "path";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import pkg from "../package.json";
import { nodeResolve } from "@rollup/plugin-node-resolve";

export default defineConfig({
  mode: process.env.NODE_ENV,
  root: join(__dirname, "../src/renderer"),
  plugins: [react()],
  base: "./",
  build: {
    emptyOutDir: true,
    outDir: "../../build/renderer",
    rollupOptions: {
      plugins: [
        nodeResolve({
          browser: true,
          preferBuiltins: false,
        }),
      ],
    },
  },
  server: {
    host: pkg.env.HOST,
    port: pkg.env.PORT,
  },
});
