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
    // 1. Validar que no esté vacío
    if (!titulo.trim() || !mensaje.trim()) {
      Alert.alert('Campos vacíos', 'Por favor, escribe un título y el cuerpo del mensaje.');
      return;
    }

    // 2. Confirmación antes de enviar (para evitar sustos)
    Alert.alert(
      'Confirmar envío',
      '¿Estás seguro? Este mensaje llegará al instante a todos los móviles que tengan la app.',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'SÍ, ENVIAR AHORA',
          style: 'destructive',
          onPress: ejecutarEnvio
        }
      ]
    );
  }

  async function ejecutarEnvio() {
    setEnviando(true);
    try {
      // 3. Obtener los tokens de la tabla que creamos en Supabase
      const { data: registros, error: errorTokens } = await supabase
        .from('notificaciones_tokens')
        .select('token');

      if (errorTokens) throw new Error('Error al obtener los tokens');

      if (!registros || registros.length === 0) {
        Alert.alert('Sin destinatarios', 'Nadie ha abierto la app todavía para recibir notificaciones.');
        setEnviando(false);
        return;
      }

      const tokens = registros.map(r => r.token);

      // 4. Enviar a los servidores de Expo
      // Expo acepta hasta 100 mensajes por petición, para un pueblo sobra.
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
          title: `📢 ${titulo.trim()}`, // Añadimos un emoji de bando automáticamente
          body: mensaje.trim(),
          badge: 1,
          data: { tipo: 'bando' },
        }))),
      });

      const resultado = await respuesta.json();

      if (respuesta.ok) {
        Alert.alert(
          '¡Bando enviado!',
          `El aviso ha sido procesado correctamente para ${tokens.length} vecinos.`,
          [{ text: 'Entendido', onPress: () => router.back() }]
        );
      } else {
        console.error("Error Expo API:", resultado);
        throw new Error('Fallo en el servidor de notificaciones');
      }

    } catch (err) {
      console.error(err);
      Alert.alert('Error crítico', 'No se pudo enviar la notificación. Revisa tu conexión.');
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
        title: 'Enviar Bando Urgente',
        headerStyle: { backgroundColor: '#C0392B' },
        headerTintColor: '#fff'
      }} />

      <ScrollView style={styles.container} contentContainerStyle={styles.contenido}>
        <View style={styles.headerIcono}>
          <Ionicons name="megaphone-outline" size={60} color="#C0392B" />
          <Text style={styles.instrucciones}>
            Escribe el mensaje que quieres que aparezca en el móvil de los vecinos.
          </Text>
        </View>

        <View style={styles.formulario}>
          <Text style={styles.label}>TÍTULO DEL AVISO</Text>
          <TextInput
            style={styles.input}
            placeholder="Ej: Avería en el depósito de agua"
            placeholderTextColor="#999"
            value={titulo}
            onChangeText={setTitulo}
          />

          <Text style={styles.label}>MENSAJE</Text>
          <TextInput
            style={styles.textarea}
            placeholder="Escribe aquí los detalles del bando..."
            placeholderTextColor="#999"
            multiline
            numberOfLines={6}
            value={mensaje}
            onChangeText={setMensaje}
          />
        </View>

        <TouchableOpacity
          style={[styles.boton, enviando && styles.botonDesactivado]}
          onPress={enviarNotificacion}
          disabled={enviando}
        >
          {enviando ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <>
              <Ionicons name="send" size={20} color="#fff" style={{marginRight: 10}} />
              <Text style={styles.botonTexto}>ENVIAR A TODO EL PUEBLO</Text>
            </>
          )}
        </TouchableOpacity>

        <Text style={styles.nota}>* El envío es irreversible. Úsalo con responsabilidad.</Text>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8F9FA' },
  contenido: { padding: 25 },
  headerIcono: { alignItems: 'center', marginBottom: 30 },
  instrucciones: {
    textAlign: 'center',
    color: '#666',
    fontSize: 15,
    marginTop: 15,
    lineHeight: 22
  },
  formulario: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 20,
    elevation: 4,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 10
  },
  label: {
    fontSize: 12,
    fontWeight: '800',
    color: '#C0392B',
    marginBottom: 8,
    letterSpacing: 1
  },
  input: {
    borderBottomWidth: 1,
    borderBottomColor: '#EEE',
    paddingVertical: 12,
    fontSize: 18,
    fontWeight: '700',
    color: '#333',
    marginBottom: 25
  },
  textarea: {
    minHeight: 120,
    textAlignVertical: 'top',
    fontSize: 16,
    color: '#444',
    lineHeight: 24
  },
  boton: {
    backgroundColor: '#C0392B',
    borderRadius: 15,
    paddingVertical: 18,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 30,
    elevation: 5
  },
  botonDesactivado: { opacity: 0.6 },
  botonTexto: { color: '#fff', fontSize: 16, fontWeight: '900' },
  nota: {
    textAlign: 'center',
    color: '#999',
    fontSize: 12,
    marginTop: 20,
    fontStyle: 'italic'
  }
});
