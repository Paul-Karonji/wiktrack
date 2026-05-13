import * as React from 'react';

import { SmsReaderViewProps } from './SmsReader.types';

export default function SmsReaderView(props: SmsReaderViewProps) {
  return (
    <div>
      <iframe
        style={{ flex: 1 }}
        src={props.url}
        onLoad={() => props.onLoad({ nativeEvent: { url: props.url } })}
      />
    </div>
  );
}
