# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [0.1.2] - 2026-09-12

### Changed

- iOS: depend on [ios-video-kit](https://github.com/xentechltd/ios-video-kit) **1.0.2** (config plugin + CocoaPods `VideoKit ~> 1.0.2`).
- iOS: remove output file-size polling in the Expo bridge; progress is forwarded from native VideoKit only.
- Config plugin: update existing `VideoKit` extra pod entry when re-running prebuild (so pod tag upgrades apply).

## [0.1.1] - 2026-09-11

### Fixed

- Android `convertAndUpload` progress: file-size polling stays in the convert band (0–50%) and stops when upload starts, so upload progress (50–100%) is no longer blocked at ~95%.

## [0.1.0] - 2026-07-31

### Added

- Expo native module wrapping [ios-video-kit](https://github.com/xentechltd/ios-video-kit) and [android-video-kit](https://github.com/xentechltd/android-video-kit).
- `VideoKit` API: `convert`, `upload`, `convertAndUpload` with `onProgress` (0.0–1.0).
- Config plugin for VideoKit CocoaPod (Git) and JitPack Maven repository.
- Example app with video picking, conversion, and progress UI.

[0.1.2]: https://github.com/xentechltd/expo-video-kit/releases/tag/v0.1.2
[0.1.1]: https://github.com/xentechltd/expo-video-kit/releases/tag/v0.1.1
[0.1.0]: https://github.com/xentechltd/expo-video-kit/releases/tag/v0.1.0
