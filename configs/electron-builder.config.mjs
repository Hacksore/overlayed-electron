/**
 * @type {import('electron-builder').Configuration}
 */
const config = {
  appId: "com.hacksore.overlayed",
  asar: true,
  productName: "Overlayed",
  directories: {
    buildResources: "public",
  },
  files: ["build/**/*", "node_modules/**/*"],
  mac: {
    artifactName: "${productName}-${version}-${os}-${arch}.${ext}",
    target: [
      {
        target: "dmg",
        arch: ["universal"],
      },
    ],
    icon: "public/img/icon-mac.icns",
    entitlements: "configs/entitlements.mac.inherit.plist",
  },
  win: {
    target: ["msi"],
    icon: "public/img/icon.png",
    artifactName: "${productName}-${version}-${os}-${arch}.${ext}",
  },
  linux: {
    target: ["zip"],
    icon: "public/img/icon.png",
    artifactName: "${productName}-${version}-${os}-${arch}.${ext}",
  },
  afterSign: "scripts/afterSignHook.js",
};

export { config };
