process.env.NODE_ENV = "production";

import { build as electronBuild } from "electron-builder";
import { config as builderConfig } from "../configs/electron-builder.config.mjs";
import chalk from "chalk";

const TAG = chalk.bgBlue("[build.mjs]");
const { GIT_BRANCH = "develop" } = process.env;

// only attempt to publish changes on a master build
const publish = GIT_BRANCH === "master" ? "always" : "never";

console.log("Current branch", GIT_BRANCH);

// only notarize in master branch
if (GIT_BRANCH !== "master") {
  delete process.env.APPLE_ID;
  delete process.env.APPLE_PASSWORD;
}

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
