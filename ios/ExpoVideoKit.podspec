Pod::Spec.new do |s|
  s.name           = 'ExpoVideoKit'
  s.version        = '0.1.2'
  s.summary        = 'Expo module for native video conversion and upload'
  s.description    = 'Wraps ios-video-kit and android-video-kit for Expo apps.'
  s.author         = 'Xentech'
  s.homepage       = 'https://github.com/xentechltd/expo-video-kit'
  s.platforms      = {
    :ios => '15.0',
    :tvos => '15.0'
  }
  s.source         = {
    git: 'https://github.com/xentechltd/expo-video-kit.git',
    tag: "v#{s.version}"
  }
  s.static_framework = true

  s.dependency 'ExpoModulesCore'
  s.dependency 'VideoKit', '~> 1.0.2'

  s.pod_target_xcconfig = {
    'DEFINES_MODULE' => 'YES',
  }

  s.source_files = '**/*.{h,m,mm,swift,hpp,cpp}'
end
