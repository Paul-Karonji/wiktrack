import { registerRootComponent } from 'expo';
import { AppRegistry } from 'react-native';

import App from './App';
import { SMS_RECEIVED_TASK, handleSmsReceivedTask } from './src/tasks/smsReceivedTask';

// registerRootComponent calls AppRegistry.registerComponent('main', () => App);
// It also ensures that whether you load the app in Expo Go or in a native build,
// the environment is set up appropriately
registerRootComponent(App);

AppRegistry.registerHeadlessTask(SMS_RECEIVED_TASK, () => handleSmsReceivedTask);
