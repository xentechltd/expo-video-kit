// Learn more https://docs.expo.io/guides/customizing-metro
const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

const projectRoot = __dirname;
const workspaceRoot = path.resolve(projectRoot, '..');

const config = getDefaultConfig(projectRoot);

// npm v7+ will install ../node_modules/react and ../node_modules/react-native because of peerDependencies.
// To prevent the incompatible react-native between ./node_modules/react-native and ../node_modules/react-native,
// excludes the one from the parent folder when bundling.
config.resolver.blockList = [
  ...Array.from(config.resolver.blockList ?? []),
  // On windows the path will resolve with `\`. We need to escape it with `\\` for the RegExp.
  new RegExp(path.resolve(workspaceRoot, 'node_modules', 'react').replace(/\\/g, '\\\\')),
  new RegExp(path.resolve(workspaceRoot, 'node_modules', 'react-native').replace(/\\/g, '\\\\')),
  new RegExp(path.resolve(workspaceRoot, 'node_modules', '@react-native').replace(/\\/g, '\\\\')),
];

// Resolve dependencies from the example app only. The parent workspace may contain
// mismatched Expo 55 tooling (e.g. babel-preset-expo) that breaks RN 0.86 codegen.
config.resolver.nodeModulesPaths = [path.resolve(projectRoot, 'node_modules')];

config.resolver.extraNodeModules = {
  'expo-video-kit': workspaceRoot,
};

config.watchFolders = [workspaceRoot];

config.transformer.getTransformOptions = async () => ({
  transform: {
    experimentalImportSupport: false,
    inlineRequires: true,
  },
});

module.exports = config;
