# expo-video-kit

Expo module that wraps the native [ios-video-kit](https://github.com/xentechltd/ios-video-kit) and [android-video-kit](https://github.com/xentechltd/android-video-kit) libraries for video conversion and upload in React Native / Expo apps.

## Requirements

- Expo SDK 57+
- iOS 15.0+
- Android SDK 24+
- **Platforms:** iOS and Android (native dev builds). Web is not supported — conversion and upload require native VideoKit.

## Native dependencies

This module does not reimplement video processing. It wires your app to:

| Platform | Library | Version (via config plugin / Gradle) |
|----------|---------|--------------------------------------|
| iOS | [ios-video-kit](https://github.com/xentechltd/ios-video-kit) | Git tag `1.0.2` (CocoaPods `VideoKit ~> 1.0.2`) |
| Android | [android-video-kit](https://github.com/xentechltd/android-video-kit) | JitPack `v1.0.1` |

You must use the **config plugin** (`"plugins": ["expo-video-kit"]`) so prebuild adds the pod and Maven repo. Installing the package alone is not enough for native linking.

After upgrading **ios-video-kit**, run `npx expo prebuild --clean` so the config plugin refreshes the `VideoKit` pod tag.

## Install from GitHub

Add the dependency in your Expo app:

```json
{
  "dependencies": {
    "expo-video-kit": "github:xentechltd/expo-video-kit"
  }
}
```

Pin a release tag or commit for reproducible builds:

```json
"expo-video-kit": "github:xentechltd/expo-video-kit#v0.1.2"
```

Then install:

```sh
npm install
```

Enable the config plugin in `app.json` or `app.config.js`:

```json
{
  "expo": {
    "plugins": ["expo-video-kit"]
  }
}
```

The plugin adds the [VideoKit](https://github.com/xentechltd/ios-video-kit) CocoaPod (Git) and the JitPack Maven repository for [android-video-kit](https://github.com/xentechltd/android-video-kit).

Rebuild the native app (required after install or upgrade):

```sh
npx expo prebuild
npx expo run:ios
npx expo run:android
```

## Usage

```typescript
import { ConversionConfigDefault, VideoKit } from 'expo-video-kit';

const videoKit = new VideoKit();

await videoKit.convert(
  inputUri,
  outputPath,
  ConversionConfigDefault,
  (progress) => console.log(progress)
);

await videoKit.upload(
  outputPath,
  presignedPutUrl,
  { contentType: 'video/mp4' },
  (progress) => console.log(progress)
);

await videoKit.convertAndUpload(
  inputUri,
  presignedPutUrl,
  ConversionConfigDefault,
  { contentType: 'video/mp4' },
  (progress) => console.log(progress)
);
```

### API

| Method | Description |
|--------|-------------|
| `convert(inputURL, outputPath, config?, onProgress?)` | Convert a local video file |
| `upload(filePath, url, config?, onProgress?)` | Upload to a presigned URL |
| `convertAndUpload(inputURL, uploadURL, conversionConfig?, uploadConfig?, onProgress?, outputPath?)` | Convert then upload (progress 0–50% convert, 50–100% upload) |

### Progress

- Callbacks receive values in **`0.0–1.0`**.
- **`convertAndUpload`:** native VideoKit maps **0–0.5** to convert and **0.5–1.0** to upload on a single callback.
- **iOS:** progress is forwarded from **ios-video-kit** (no file-size polling in this module).
- **Android:** during **convert** (and the convert phase of `convertAndUpload`), the bridge may supplement sparse encoder callbacks by polling output file size when an output path is known. **Upload** progress always comes from the native HTTP stack.
- `outputPath` is optional in `convertAndUpload` (default: app cache as `converted_{original_name}`). On Android, an explicit path can improve convert-phase progress when polling is used.

Pass filesystem paths or `file://` URIs; the module normalizes them on native.

### Picking videos in the app

Use something like [`expo-image-picker`](https://docs.expo.dev/versions/latest/sdk/imagepicker/) for the library URI, and [`expo-file-system`](https://docs.expo.dev/versions/latest/sdk/filesystem/) for cache output paths. See the [example app](./example/App.tsx).

On iOS, add a photo-library usage string (plugin or `ios.infoPlist`), for example:

```json
{
  "expo": {
    "plugins": [
      ["expo-image-picker", { "photosPermission": "Allow access to your videos to convert them." }]
    ],
    "ios": {
      "infoPlist": {
        "NSPhotoLibraryUsageDescription": "Allow access to your videos to convert them."
      }
    }
  }
}
```

### Troubleshooting

| Symptom | What to try |
|---------|-------------|
| Native module missing / convert does nothing | Run `npx expo prebuild --clean`, then `npx expo run:ios` or `run:android`. Confirm `"plugins": ["expo-video-kit"]` is in app config. |
| Android dependency not found | Ensure prebuild ran after install; the plugin adds JitPack to Gradle. |
| Convert fails immediately | Use a readable input path/URI and a writable **filesystem** output path. |
| iOS progress flat or jumpy | Upgrade to **expo-video-kit v0.1.2+** and **ios-video-kit 1.0.2+** (`prebuild --clean`). |
| Android convert progress at 0% until done | Pass an explicit `outputPath` so the bridge can poll output file growth during convert. |

## Install from npm (optional)

When published:

```sh
npx expo install expo-video-kit
```

Same plugin and native rebuild steps as above.

## Develop this repo

```sh
npm install
npm run build
cd example
npm install
npx expo prebuild
npx expo run:ios
```

The example app depends on `"expo-video-kit": "file:.."`. Generated `example/ios` and `example/android` folders are gitignored; run prebuild locally.

### Release (maintainers)

1. Bump `package.json`, `ios/ExpoVideoKit.podspec`, and `android/build.gradle` version fields.
2. Update [CHANGELOG](./CHANGELOG.md).
3. `npm run build` and commit the `build/` output.
4. Push `main`, then tag and push: `git tag vX.Y.Z && git push origin vX.Y.Z` (tag must match podspec `v#{version}`).

## License

Apache-2.0 — see [LICENSE](./LICENSE). See [CHANGELOG](./CHANGELOG.md) for release notes.
