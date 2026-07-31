export type ConversionConfig = {
    targetWidth?: number;
    targetHeight?: number;
    targetFps?: number;
    videoMimeType?: string;
    portraitEncodingEnabled?: boolean;
};
export declare const ConversionConfigDefault: Required<ConversionConfig>;
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
//# sourceMappingURL=ExpoVideoKit.types.d.ts.map