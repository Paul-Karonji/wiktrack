import SmsReaderModule from '../../modules/sms-reader';
import { Alert } from 'react-native';

export async function readSmsMessages(filter) {
  try {
    if (SmsReaderModule) {
      const messages = await SmsReaderModule.readSms(filter);
      Alert.alert('Debug (Native)', `Read ${messages.length} SMS messages.`);
      return messages;
    } else {
      Alert.alert('Debug Error', 'SmsReaderModule is null (Native module did not load).');
    }
  } catch (error) {
    Alert.alert('Debug Crash', `Failed to read SMS: ${error.message}`);
    console.error('Failed to read SMS via native module:', error);
  }
  return [];
}
