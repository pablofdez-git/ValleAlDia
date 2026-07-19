import { Stack } from 'expo-router';
import { useEffect } from 'react';
import Constants from 'expo-constants';

export default function RootLayout() {
  useEffect(() => {
    async function inicializar() {
      try {
        const isExpoGo = Constants.appOwnership === 'expo';
        if (isExpoGo) return;

        const { default: Device } = await import('expo-device');
        if (!Device.isDevice) return;

        const Notifications = await import('expo-notifications');

        Notifications.default.setNotificationHandler({
          handleNotification: async () => ({
            shouldShowAlert: true,
            shouldPlaySound: true,
            shouldSetBadge: false,
          }),
        });

        const { status: existingStatus } = await Notifications.default.getPermissionsAsync();
        let finalStatus = existingStatus;
        if (existingStatus !== 'granted') {
          const { status } = await Notifications.default.requestPermissionsAsync();
          finalStatus = status;
        }
        if (finalStatus !== 'granted') return;

        const projectId = Constants.expoConfig?.extra?.eas?.projectId;
        if (!projectId) return;

        const token = (await Notifications.default.getExpoPushTokenAsync({ projectId })).data;
        if (!token) return;

        const { supabase } = await import('../lib/supabase');
        await supabase.from('push_tokens').upsert({ token }, { onConflict: 'token' });

      } catch (error) {
        console.log('Error notificaciones:', error.message);
      }
    }

    inicializar();
  }, []);

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" options={{ headerShown: false }} />
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="login" options={{ headerShown: false, presentation: 'modal' }} />
    </Stack>
  );
}
