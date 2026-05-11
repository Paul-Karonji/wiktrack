import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import { supabase } from './supabase';

// Configure how notifications appear when app is open
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

// Request permission + get push token + save to Supabase
export async function registerForPushNotifications(businessId) {
  if (Platform.OS !== 'android') return null;

  // Create Android notification channel
  await Notifications.setNotificationChannelAsync('default', {
    name: 'WikTrack Alerts',
    importance: Notifications.AndroidImportance.MAX,
    vibrationPattern: [0, 250, 250, 250],
  });

  // Request permission
  const { status } = await Notifications.requestPermissionsAsync();
  if (status !== 'granted') return null;

  // Get the push token (this is the 'address' for this phone)
  const token = (await Notifications.getExpoPushTokenAsync()).data;

  // Save token to Supabase so backend can send notifications
  await supabase
    .from('businesses')
    .update({ push_token: token })
    .eq('id', businessId);

  return token;
}
