import { Stack } from 'expo-router';
import { useEffect } from 'react';
import { Platform, View, Text } from 'react-native';
import * as Device from 'expo-device';
import Constants from 'expo-constants';
import { supabase } from '../lib/supabase';

// NOTA: No importamos Notifications aquí arriba para evitar el crash en Expo Go Android
// Lo cargaremos dinámicamente solo si es posible

export default function RootLayout() {

  useEffect(() => {
    async function configurarNotificaciones() {
      // 1. SI ESTAMOS EN EXPO GO (Android), NO HACER NADA (Evita el crash)
      if (Constants.appOwnership === 'expo' && Platform.OS === 'android') {
        console.warn("Notificaciones desactivadas en Expo Go Android por requisitos de Expo SDK.");
        return;
      }

      // 2. Solo intentar si es un dispositivo físico
      if (!Device.isDevice) return;

      try {
        // Importamos la librería de forma dinámica (solo cuando se necesita)
        const Notifications = require('expo-notifications');

        // Configuración básica
        Notifications.setNotificationHandler({
          handleNotification: async () => ({
            shouldShowAlert: true,
            shouldPlaySound: true,
            shouldSetBadge: false,
          }),
        });

        const { status: existingStatus } = await Notifications.getPermissionsAsync();
        let finalStatus = existingStatus;

        if (existingStatus !== 'granted') {
          const { status } = await Notifications.requestPermissionsAsync();
          finalStatus = status;
        }

        if (finalStatus !== 'granted') return;

        if (Platform.OS === 'android') {
          await Notifications.setNotificationChannelAsync('default', {
            name: 'default',
            importance: Notifications.AndroidImportance.MAX,
            vibrationPattern: [0, 250, 250, 250],
            lightColor: '#1B4D3E',
          });
        }

        const projectId = Constants.expoConfig?.extra?.eas?.projectId || Constants.easConfig?.projectId;
        if (!projectId) return;

        const token = (await Notifications.getExpoPushTokenAsync({ projectId })).data;

        // Guardar en Supabase
        await supabase
          .from('notificaciones_tokens')
          .upsert({ token: token }, { onConflict: 'token' });

      } catch (err) {
        console.log("Notificaciones no disponibles en este entorno:", err.message);
      }
    }

    configurarNotificaciones();
  }, []);

  return (
    <Stack screenOptions={{ headerShown: false }}>
      {/* Esto asegura que las pantallas se carguen correctamente */}
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
    </Stack>
  );
}
