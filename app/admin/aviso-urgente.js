import { useState } from 'react';
import {
  View, Text, StyleSheet, TextInput, TouchableOpacity,
  Alert, ActivityIndicator, KeyboardAvoidingView, Platform, ScrollView
} from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { supabase } from '../../lib/supabase';

export default function AvisoUrgente() {
  const [titulo, setTitulo] = useState('');
  const [mensaje, setMensaje] = useState('');
  const [enviando, setEnviando] = useState(false);
  const router = useRouter();

  async function enviarNotificacion() {
    if (!titulo.trim() || !mensaje.trim()) {
      Alert.alert('Campos vacíos', 'Escribe un título y un mensaje.');
      return;
    }

    Alert.alert(
      'Confirmar bando',
      '¿Enviar este mensaje a todos los vecinos?',
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'ENVIAR', style: 'destructive', onPress: ejecutarEnvio }
      ]
    );
  }

  async function ejecutarEnvio() {
    setEnviando(true);
    try {
      // 1. Obtener los tokens de Supabase
      const { data: registros, error: errorSupabase } = await supabase
        .from('notificaciones_tokens')
        .select('token');

      if (errorSupabase) {
        throw new Error(`Error Supabase: ${errorSupabase.message}`);
      }

      if (!registros || registros.length === 0) {
        Alert.alert('Sin destino', 'No hay ningún móvil registrado todavía.');
        setEnviando(false);
        return;
      }

      const tokens = registros.map(r => r.token);

      // 2. Enviar a Expo
      const respuesta = await fetch('https://exp.host/--/api/v2/push/send', {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Accept-encoding': 'gzip, deflate',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(tokens.map(token => ({
          to: token,
          sound: 'default',
          title: `📢 ${titulo.trim()}`,
          body: mensaje.trim(),
          badge: 1,
        }))),
      });

      if (respuesta.ok) {
        Alert.alert('¡Éxito!', `Enviado a ${tokens.length} vecinos.`, [
          { text: 'OK', onPress: () => router.back() }
        ]);
      } else {
        throw new Error('El servidor de notificaciones no respondió bien.');
      }

    } catch (err) {
      Alert.alert('Error de conexión', err.message);
      console.error(err);
    } finally {
      setEnviando(false);
    }
  }

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <Stack.Screen options={{
        title: 'Bando Urgente',
        headerStyle: { backgroundColor: '#C0392B' },
        headerTintColor: '#fff'
      }} />

      <ScrollView contentContainerStyle={styles.contenido}>
        <View style={styles.formulario}>
          <Text style={styles.label}>TÍTULO</Text>
          <TextInput
            style={styles.input}
            placeholder="Ej: Corte de agua hoy"
            placeholderTextColor="#999"
            value={titulo}
            onChangeText={setTitulo}
          />

          <Text style={styles.label}>MENSAJE</Text>
          <TextInput
            style={styles.textarea}
            placeholder="Escribe los detalles aquí..."
            placeholderTextColor="#999"
            multiline
            value={mensaje}
            onChangeText={setMensaje}
          />
        </View>

        <TouchableOpacity
          style={[styles.boton, enviando && { opacity: 0.6 }]}
          onPress={enviarNotificacion}
          disabled={enviando}
        >
          {enviando ? <ActivityIndicator color="#fff" /> : (
            <Text style={styles.botonTexto}>ENVIAR AHORA</Text>
          )}
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  contenido: { padding: 25 },
  formulario: { backgroundColor: '#fff', borderRadius: 20, padding: 20, elevation: 5 },
  label: { fontSize: 12, fontWeight: '800', color: '#C0392B', marginBottom: 5 },
  input: { borderBottomWidth: 1, borderBottomColor: '#eee', paddingVertical: 10, fontSize: 18, marginBottom: 20, color: '#333' },
  textarea: { minHeight: 120, textAlignVertical: 'top', fontSize: 16, color: '#333' },
  boton: { backgroundColor: '#C0392B', borderRadius: 15, paddingVertical: 18, alignItems: 'center', marginTop: 30 },
  botonTexto: { color: '#fff', fontSize: 16, fontWeight: '900' }
});
