import { NativeModule, requireNativeModule } from 'expo';

import type {
  ConversionConfig,
  ExpoVideoKitModuleEvents,
  UploadConfig,
} from './ExpoVideoKit.types';

declare class ExpoVideoKitModule extends NativeModule<ExpoVideoKitModuleEvents> {
  convert(inputUri: string, outputPath: string, config: ConversionConfig): Promise<void>;
  upload(filePath: string, url: string, config: UploadConfig): Promise<void>;
  convertAndUpload(
    inputUri: string,
    uploadUrl: string,
    outputPath: string | null,
    conversionConfig: ConversionConfig,
    uploadConfig: UploadConfig
  ): Promise<void>;
}

export default requireNativeModule<ExpoVideoKitModule>('ExpoVideoKit');
