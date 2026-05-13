import { registerWebModule, NativeModule } from 'expo';

import { ChangeEventPayload } from './SmsReader.types';

type SmsReaderModuleEvents = {
  onChange: (params: ChangeEventPayload) => void;
}

class SmsReaderModule extends NativeModule<SmsReaderModuleEvents> {
  PI = Math.PI;
  async setValueAsync(value: string): Promise<void> {
    this.emit('onChange', { value });
  }
  hello() {
    return 'Hello world! 👋';
  }
};

export default registerWebModule(SmsReaderModule, 'SmsReaderModule');
