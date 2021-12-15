/**
 * @type {import('electron-builder').Configuration}
 */

const getDarwinTargets = () => {
  if (process.env.CI) {
    return [
      {
        target: "dmg",
        arch: ["x64", "arm64"],
      },
      {
        target: "zip",
        arch: ["x64", "arm64"],
      },
    ];
  }

  // building only on m1/zip locally
  return [
    {
      target: "zip",
      arch: ["arm64"],
    },
  ];
};

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
    target: getDarwinTargets(),
    icon: "public/img/icon-mac.icns",
    entitlements: "configs/entitlements.mac.inherit.plist",
  },
  win: {
    target: ["nsis"],
    icon: "public/img/icon.ico",
    artifactName: "${productName}-${version}-${os}-${arch}.${ext}",
  },
  linux: {
    target: ["zip"],
    icon: "public/img/icon.png",
    artifactName: "${productName}-${version}-${os}-${arch}.${ext}",
  },
  nsis: {
    oneClick: false,
    perMachine: false,
    allowToChangeInstallationDirectory: true,
    installerIcon: "img/icon.ico",
    uninstallerIcon: "img/icon.ico",
    installerHeader: "img/installer-icon.bmp",
    installerSidebar: "img/sidebar.bmp",
    uninstallerSidebar: "img/sidebar.bmp",
  },
  afterSign: "scripts/afterSignHook.js",
};

export { config };
