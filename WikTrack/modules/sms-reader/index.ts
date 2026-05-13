// Reexport the native module. On web, it will be resolved to SmsReaderModule.web.ts
// and on native platforms to SmsReaderModule.ts
export { default } from './src/SmsReaderModule';
export { default as SmsReaderView } from './src/SmsReaderView';
export * from  './src/SmsReader.types';
