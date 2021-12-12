process.env.NODE_ENV = "production";

import { build as electronBuild } from "electron-builder";
import { config as builderConfig } from "../configs/electron-builder.config.mjs";
import chalk from "chalk";

const TAG = chalk.bgBlue("[build.mjs]");

// grab the env to see if we should publish
const { GIT_BRANCH = "refs/heads/master" } = process.env;
const publish = GIT_BRANCH === "refs/heads/master" ? "always" : "never";

async function packElectron() {
  return electronBuild({
    publish,
    config: builderConfig,
  }).then(result => {
    console.log(TAG, "files:", chalk.green(result));
  });
}

// pack
await packElectron();
