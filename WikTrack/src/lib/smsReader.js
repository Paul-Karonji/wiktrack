import SmsReaderModule from '../../modules/sms-reader';

export async function readSmsMessages(filter) {
  try {
    if (SmsReaderModule) {
      return await SmsReaderModule.readSms(filter);
    }
  } catch (error) {
    console.error('Failed to read SMS via native module:', error);
  }
  return [];
}
