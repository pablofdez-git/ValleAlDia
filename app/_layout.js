import { Stack } from 'expo-router';
import { useEffect } from 'react';
import { Platform } from 'react-native';
import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import Constants from 'expo-constants';
import { supabase } from '../lib/supabase';

// Configuración de cómo se ven las notificaciones
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

export default function RootLayout() {
  useEffect(() => {
    async function inicializarNotificaciones() {
      // Si es un simulador o Expo Go en Android, evitamos crash
      if (Constants.appOwnership === 'expo' && Platform.OS === 'android') return;
      if (!Device.isDevice) return;

      try {
        const { status: existingStatus } = await Notifications.getPermissionsAsync();
        let finalStatus = existingStatus;
        if (existingStatus !== 'granted') {
          const { status } = await Notifications.requestPermissionsAsync();
          finalStatus = status;
        }
        if (finalStatus !== 'granted') return;

        const projectId = Constants.expoConfig?.extra?.eas?.projectId || Constants.easConfig?.projectId;
        if (!projectId) return;

        const token = (await Notifications.getExpoPushTokenAsync({ projectId })).data;

        if (token) {
          await supabase.from('notificaciones_tokens').upsert({ token: token }, { onConflict: 'token' });
        }
      } catch (error) {
        console.log("Error en notificaciones:", error.message);
      }
    }

    inicializarNotificaciones();
  }, []);

  return (
    <Stack screenOptions={{ headerShown: false }}>
      {/* Registramos el index para que la redirección funcione */}
      <Stack.Screen name="index" options={{ headerShown: false }} />
      {/* Registramos el contenedor de las pestañas */}
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      {/* Registramos el login por si acaso */}
      <Stack.Screen name="login" options={{ headerShown: false, presentation: 'modal' }} />
    </Stack>
  );
}
