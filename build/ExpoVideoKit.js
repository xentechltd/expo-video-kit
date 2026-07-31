import { ConversionConfigDefault, } from './ExpoVideoKit.types';
import ExpoVideoKitModule from './ExpoVideoKitModule';
function mergeConversionConfig(config) {
    return {
        ...ConversionConfigDefault,
        ...config,
    };
}
function mergeUploadConfig(config) {
    return {
        contentType: 'video/mp4',
        method: 'PUT',
        ...config,
    };
}
async function withProgressListener(onProgress, operation) {
    if (!onProgress) {
        await operation();
        return;
    }
    let lastProgress = -1;
    const subscription = ExpoVideoKitModule.addListener('onProgress', ({ progress }) => {
        const normalized = Number(progress);
        if (!Number.isFinite(normalized)) {
            return;
        }
        lastProgress = normalized;
        onProgress(normalized);
    });
    onProgress(0);
    try {
        await new Promise((resolve) => {
            queueMicrotask(resolve);
        });
        await operation();
        if (lastProgress < 1) {
            onProgress(1);
        }
    }
    finally {
        subscription.remove();
    }
}
export class VideoKit {
    async convert(inputURL, outputPath, config = ConversionConfigDefault, onProgress) {
        return withProgressListener(onProgress, () => ExpoVideoKitModule.convert(inputURL, outputPath, mergeConversionConfig(config)));
    }
    async upload(filePath, url, config = {}, onProgress) {
        return withProgressListener(onProgress, () => ExpoVideoKitModule.upload(filePath, url, mergeUploadConfig(config)));
    }
    async convertAndUpload(inputURL, uploadURL, conversionConfig = ConversionConfigDefault, uploadConfig = {}, onProgress, outputPath) {
        return withProgressListener(onProgress, () => ExpoVideoKitModule.convertAndUpload(inputURL, uploadURL, outputPath ?? null, mergeConversionConfig(conversionConfig), mergeUploadConfig(uploadConfig)));
    }
}
export { ConversionConfigDefault };
export default VideoKit;
//# sourceMappingURL=ExpoVideoKit.js.map