/**
 * @type {import('electron-builder').Configuration}
 */
const config = {
  $schema: "http://json.schemastore.org/electron-builder",
  productName: "Overlayed",
  appId: "com.hacksore.overlayed",
  directories: {
    buildResources: "public",
  },
  extends: null,
  extraMetadata: {
    main: "build/electron/main.js",
  },
  files: ["build/**/*", "node_modules/**/*"],
  mac: {
    target: ["dmg"],
    icon: "build/img/icon-mac.icns",
    artifactName: "${productName}-${version}-${os}-${arch}.${ext}",
    entitlements: "./entitlements.mac.inherit.plist",
  },
  win: {
    target: ["msi"],
    icon: "build/img/icon.png",
    artifactName: "${productName}-${version}-${os}-${arch}.${ext}",
  },
  linux: {
    target: ["zip"],
    icon: "build/img/icon.png",
    artifactName: "${productName}-${version}-${os}-${arch}.${ext}",
  },
  afterSign: "./scripts/note.js",
};

export { config };
