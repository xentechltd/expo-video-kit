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
| iOS | [ios-video-kit](https://github.com/xentechltd/ios-video-kit) | Git tag `1.0.1` (CocoaPods `VideoKit ~> 1.0.1`) |
| Android | [android-video-kit](https://github.com/xentechltd/android-video-kit) | JitPack `v1.0.1` |

You must use the **config plugin** (`"plugins": ["expo-video-kit"]`) so prebuild adds the pod and Maven repo. Installing the package alone is not enough for native linking.

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
"expo-video-kit": "github:xentechltd/expo-video-kit#v0.1.0"
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

- `outputPath` is optional in `convertAndUpload`; default is app cache as `converted_{original_name}`.
- Progress callbacks receive values in `0.0–1.0`.
- Pass filesystem paths or `file://` URIs; the module normalizes them on native.

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
| Convert fails immediately | Use a readable input path/URI and a writable **filesystem** output path (not only a `file://` string if native rejects it — this module normalizes URIs when possible). |
| Progress stays at 0% until done | Some sources report sparse progress; the native layer also estimates from output file size during conversion. |

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

### First release (maintainers)

1. `npm run build` and commit the `build/` output (GitHub installs use `main` without running `prepare` in all setups).
2. Push to `https://github.com/xentechltd/expo-video-kit`.
3. Tag the release so consumers can pin: `git tag v0.1.0 && git push origin v0.1.0` (matches `package.json` version and the podspec source tag).

## License

Apache-2.0 — see [LICENSE](./LICENSE). See [CHANGELOG](./CHANGELOG.md) for release notes.
