// SMS Reader wrapper — gracefully handles missing native module
// In production, react-native-get-sms-android will be installed
// For now, provides mock data for UI testing

let SmsAndroid = null;

try {
  SmsAndroid = require('react-native-get-sms-android');
} catch (e) {
  // Module not available — use mock
}

export function readSmsMessages(filter, onFail, onSuccess) {
  if (SmsAndroid) {
    SmsAndroid.list(JSON.stringify(filter), onFail, onSuccess);
  } else {
    // Return mock data for UI testing
    const mockMessages = [
      {
        _id: 1,
        address: 'MPESA',
        body: 'TC47HJ9R01 Confirmed. You have received Ksh2,500.00 from JOHN KAMAU 0712345678 on 10/5/25 at 3:45 PM. New M-PESA balance is Ksh5,230.00.',
        date: Date.now() - 3600000,
      },
      {
        _id: 2,
        address: 'MPESA',
        body: 'TC47HJ9R02 Confirmed. You have received Ksh1,200.00 from MARY WANJIKU 0798765432 on 10/5/25 at 2:30 PM. New M-PESA balance is Ksh2,730.00.',
        date: Date.now() - 7200000,
      },
      {
        _id: 3,
        address: 'MPESA',
        body: 'TC47HJ9R03 Confirmed. You have received Ksh800.00 from PETER OCHIENG 0711222333 on 10/5/25 at 11:15 AM. New M-PESA balance is Ksh1,530.00.',
        date: Date.now() - 14400000,
      },
      {
        _id: 4,
        address: 'MPESA',
        body: 'TC47HJ9R04 Confirmed. You have received Ksh3,000.00 from ALICE MUTHONI 0722111444 on 9/5/25 at 5:00 PM. New M-PESA balance is Ksh730.00.',
        date: Date.now() - 86400000,
      },
      {
        _id: 5,
        address: 'MPESA',
        body: 'TC47HJ9R05 Confirmed. You have received Ksh500.00 from DAVID KIPROP 0733555666 on 9/5/25 at 10:00 AM. New M-PESA balance is Ksh4,230.00.',
        date: Date.now() - 100800000,
      },
    ];
    onSuccess(mockMessages.length, JSON.stringify(mockMessages));
  }
}
