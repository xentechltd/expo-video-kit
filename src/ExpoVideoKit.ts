import {
  ConversionConfigDefault,
  type ConversionConfig,
  type UploadConfig,
} from './ExpoVideoKit.types';
import ExpoVideoKitModule from './ExpoVideoKitModule';

function mergeConversionConfig(config?: ConversionConfig): ConversionConfig {
  return {
    ...ConversionConfigDefault,
    ...config,
  };
}

function mergeUploadConfig(config?: UploadConfig): UploadConfig {
  return {
    contentType: 'video/mp4',
    method: 'PUT',
    ...config,
  };
}

async function withProgressListener(
  onProgress: ((progress: number) => void) | undefined,
  operation: () => Promise<void>
): Promise<void> {
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
    await new Promise<void>((resolve) => {
      queueMicrotask(resolve);
    });
    await operation();
    if (lastProgress < 1) {
      onProgress(1);
    }
  } finally {
    subscription.remove();
  }
}

export class VideoKit {
  async convert(
    inputURL: string,
    outputPath: string,
    config: ConversionConfig = ConversionConfigDefault,
    onProgress?: (progress: number) => void
  ): Promise<void> {
    return withProgressListener(onProgress, () =>
      ExpoVideoKitModule.convert(inputURL, outputPath, mergeConversionConfig(config))
    );
  }

  async upload(
    filePath: string,
    url: string,
    config: UploadConfig = {},
    onProgress?: (progress: number) => void
  ): Promise<void> {
    return withProgressListener(onProgress, () =>
      ExpoVideoKitModule.upload(filePath, url, mergeUploadConfig(config))
    );
  }

  async convertAndUpload(
    inputURL: string,
    uploadURL: string,
    conversionConfig: ConversionConfig = ConversionConfigDefault,
    uploadConfig: UploadConfig = {},
    onProgress?: (progress: number) => void,
    outputPath?: string
  ): Promise<void> {
    return withProgressListener(onProgress, () =>
      ExpoVideoKitModule.convertAndUpload(
        inputURL,
        uploadURL,
        outputPath ?? null,
        mergeConversionConfig(conversionConfig),
        mergeUploadConfig(uploadConfig)
      )
    );
  }
}

export { ConversionConfigDefault };
export default VideoKit;
