import { registerWebModule, NativeModule } from 'expo';

import type { ExpoVideoKitModuleEvents } from './ExpoVideoKit.types';

class ExpoVideoKitModule extends NativeModule<ExpoVideoKitModuleEvents> {}

export default registerWebModule(ExpoVideoKitModule, 'ExpoVideoKit');
