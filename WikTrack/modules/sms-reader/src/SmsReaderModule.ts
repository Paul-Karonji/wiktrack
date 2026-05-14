import { NativeModule, requireOptionalNativeModule } from 'expo';

export type SmsMessage = {
  _id: number;
  address: string;
  body: string;
  date: number;
};

export type SmsFilter = {
  box?: string;
  address?: string;
  minDate?: number;
};

declare class SmsReaderModule extends NativeModule {
  readSms(filter: SmsFilter): Promise<SmsMessage[]>;
}

// This call loads the native module object from the JSI.
export default requireOptionalNativeModule<SmsReaderModule>('SmsReader');
