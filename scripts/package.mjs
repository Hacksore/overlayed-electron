process.env.NODE_ENV = "production";

import { build as electronBuild } from "electron-builder";
import { config as builderConfig } from "../configs/electron-builder.config.mjs";
import chalk from "chalk";

const TAG = chalk.bgBlue("[build.mjs]");

async function packElectron() {
  return electronBuild({
    publish: "always",
    config: builderConfig,
  }).then(result => {
    console.log(TAG, "files:", chalk.green(result));
  });
}

// pack
await packElectron();
