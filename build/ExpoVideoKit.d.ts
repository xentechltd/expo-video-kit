import { ConversionConfigDefault, type ConversionConfig, type UploadConfig } from './ExpoVideoKit.types';
export declare class VideoKit {
    convert(inputURL: string, outputPath: string, config?: ConversionConfig, onProgress?: (progress: number) => void): Promise<void>;
    upload(filePath: string, url: string, config?: UploadConfig, onProgress?: (progress: number) => void): Promise<void>;
    convertAndUpload(inputURL: string, uploadURL: string, conversionConfig?: ConversionConfig, uploadConfig?: UploadConfig, onProgress?: (progress: number) => void, outputPath?: string): Promise<void>;
}
export { ConversionConfigDefault };
export default VideoKit;
//# sourceMappingURL=ExpoVideoKit.d.ts.map