import SmsReaderModule from 'sms-reader';

export function isSmsReaderAvailable() {
  return Boolean(SmsReaderModule?.readSms);
}

export async function readSmsMessages(filter) {
  if (!isSmsReaderAvailable()) {
    throw new Error('SmsReader native module is unavailable. Rebuild the Android app after native autolinking.');
  }

  return SmsReaderModule.readSms(filter);
}
