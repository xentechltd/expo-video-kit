const {
  withGradleProperties,
  withPodfileProperties,
  createRunOncePlugin,
} = require('expo/config-plugins');

const VIDEO_KIT_POD = {
  name: 'VideoKit',
  git: 'https://github.com/xentechltd/ios-video-kit.git',
  tag: '1.0.1',
};

const JITPACK_MAVEN_REPO = 'https://jitpack.io';

function parseJsonArray(value) {
  if (!value) {
    return [];
  }

  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

const withExpoVideoKit = (config) => {
  config = withPodfileProperties(config, (podfileConfig) => {
    const extraPods = parseJsonArray(podfileConfig.modResults['apple.extraPods']);

    if (!extraPods.some((pod) => pod.name === VIDEO_KIT_POD.name)) {
      extraPods.push(VIDEO_KIT_POD);
    }

    podfileConfig.modResults['apple.extraPods'] = JSON.stringify(extraPods);
    return podfileConfig;
  });

  config = withGradleProperties(config, (gradleConfig) => {
    const extraMavenRepos = parseJsonArray(
      gradleConfig.modResults['android.extraMavenRepos']
    );

    if (!extraMavenRepos.includes(JITPACK_MAVEN_REPO)) {
      extraMavenRepos.push(JITPACK_MAVEN_REPO);
    }

    gradleConfig.modResults['android.extraMavenRepos'] = JSON.stringify(extraMavenRepos);
    return gradleConfig;
  });

  return config;
};

module.exports = createRunOncePlugin(withExpoVideoKit, 'expo-video-kit');
