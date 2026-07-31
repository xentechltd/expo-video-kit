export type ConversionConfig = {
  targetWidth?: number;
  targetHeight?: number;
  targetFps?: number;
  videoMimeType?: string;
  portraitEncodingEnabled?: boolean;
};

export const ConversionConfigDefault: Required<ConversionConfig> = {
  targetWidth: 1080,
  targetHeight: 1920,
  targetFps: 15,
  videoMimeType: 'video/avc',
  portraitEncodingEnabled: true,
};

export type UploadConfig = {
  contentType?: string;
  method?: string;
};

export type ProgressEvent = {
  progress: number;
};

export type ExpoVideoKitModuleEvents = {
  onProgress: (event: ProgressEvent) => void;
};
