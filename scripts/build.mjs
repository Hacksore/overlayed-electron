process.env.NODE_ENV = "production";

import { build as viteBuild } from "vite";
import chalk from "chalk";
import path from "path";

const TAG = chalk.bgBlue("[build.mjs]");

const viteConfigs = {
  main: "configs/vite.main.ts",
  preload: "configs/vite.preload.ts",
  react: "configs/vite.renderer.ts",
};

async function buildElectron() {
  for (const [name, configPath] of Object.entries(viteConfigs)) {
    console.group(TAG, name);

    const config = {
      configFile: configPath,
      mode: process.env.NODE_ENV,
    };

    if (name === "react") {
      config.publicDir = path.resolve("./public");
    }

    await viteBuild(config);

    console.groupEnd();
    console.log(); // for beautiful log.
  }
}

// bootstrap
await buildElectron();
