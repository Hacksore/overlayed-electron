/**
 * @type {import('electron-builder').Configuration}
 */
const config = {
  appId: "com.hacksore.overlayed",
  asar: true,
  directories: {
    output: "release/${version}",
  },
  files: ["!node_modules", "dist", "package.json"],
  mac: {
    artifactName: "${productName}-${version}-${os}-${arch}.${ext}",
    target: ["dmg"],
    icon: "public/img/icon-mac.icns",
    entitlements: "configs/entitlements.mac.inherit.plist",
  },
  win: {
    target: ["msi"],
    icon: "public/img/icon.png",
    artifactName: "${productName}-${version}-${os}-${arch}.${ext}",
  },
};

export { config };
