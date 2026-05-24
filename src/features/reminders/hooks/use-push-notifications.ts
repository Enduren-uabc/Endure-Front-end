import { useEffect, useRef } from 'react';
import { Platform } from 'react-native';

// eslint-disable-next-line @typescript-eslint/no-var-requires
const Notifications = require('expo-notifications');

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

export function usePushNotifications() {
  const notificationListener = useRef<{ remove: () => void } | null>(null);
  const responseListener = useRef<{ remove: () => void } | null>(null);

  useEffect(() => {
    async function setup() {
      const { status: existingStatus } = await Notifications.getPermissionsAsync({ iosScopes: ['alert', 'badge', 'sound'] });
      let finalStatus = existingStatus;

      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync({ iosScopes: ['alert', 'badge', 'sound'] });
        finalStatus = status;
      }

      if (finalStatus !== 'granted') {
        return;
      }

      if (Platform.OS === 'android') {
        await Notifications.setNotificationChannelAsync('default', {
          name: 'Recordatorios',
          importance: Notifications.AndroidImportance.HIGH,
          vibrationPattern: [0, 250, 250, 250],
        });
      }

      try {
        const expoToken = await Notifications.getExpoPushTokenAsync();
        const { apiClient } = await import('@/lib/api-client');
        const { API_ENDPOINTS } = await import('@/lib/api-endpoints');
        await apiClient.post(API_ENDPOINTS.push.registerToken, {
          token: expoToken.data,
          platform: Platform.OS,
        });
      } catch (error) {
        console.warn('Failed to register push token:', error);
      }
    }

    setup();

    notificationListener.current =
      Notifications.addNotificationReceivedListener((notification: any) => {
        console.log('Notification received:', notification.request.content.title);
      });

    responseListener.current =
      Notifications.addNotificationResponseReceivedListener((response: any) => {
        console.log('Notification tapped:', response.notification.request.content.title);
      });

    return () => {
      if (notificationListener.current) {
        notificationListener.current.remove();
      }
      if (responseListener.current) {
        responseListener.current.remove();
      }
    };
  }, []);
}
