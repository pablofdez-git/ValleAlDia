import { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ActivityIndicator, Alert, Image, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { supabase } from '../lib/supabase';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [cargando, setCargando] = useState(false);
  const router = useRouter();
  const [verPassword, setVerPassword] = useState(false);

  async function iniciarSesion() {
    if (!email.trim() || !password.trim()) {
      Alert.alert('Campos vacíos', 'Introduce tu email y contraseña.');
      return;
    }
    setCargando(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      Alert.alert('Error', 'Email o contraseña incorrectos.');
    } else {
      router.replace('/admin');
    }
    setCargando(false);
  }

return (
  <KeyboardAvoidingView
    style={{ flex: 1 }}
    behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
  >
    <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
      <Image
        source={require('../assets/logo.png')}
        style={styles.logo}
        resizeMode="contain"
      />
      <Text style={styles.titulo}>Panel de administración</Text>
      <Text style={styles.subtitulo}>Acceso restringido</Text>

      <TextInput
        style={styles.input}
        placeholder="Email"
        placeholderTextColor="#aaa"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
      />
      <View style={styles.inputContenedor}>
        <TextInput
          style={styles.inputPassword}
          placeholder="Contraseña"
          placeholderTextColor="#aaa"
          value={password}
          onChangeText={setPassword}
          secureTextEntry={!verPassword}
        />
        <TouchableOpacity onPress={() => setVerPassword(!verPassword)} style={styles.ojito}>
          <Text style={{ fontSize: 18 }}>{verPassword ? '🙈' : '👁️'}</Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity
        style={[styles.boton, cargando && styles.botonDesactivado]}
        onPress={iniciarSesion}
        disabled={cargando}
      >
        {cargando ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.botonTexto}>Entrar</Text>
        )}
      </TouchableOpacity>
    </ScrollView>
  </KeyboardAvoidingView>
);
}

const styles = StyleSheet.create({
  container: { flexGrow: 1, backgroundColor: '#fff', padding: 32, justifyContent: 'center' },
  logo: { width: 120, height: 120, alignSelf: 'center', marginBottom: 24 },
  titulo: { fontSize: 22, fontWeight: '800', color: '#1B4D3E', textAlign: 'center', marginBottom: 6 },
  subtitulo: { fontSize: 14, color: '#999', textAlign: 'center', marginBottom: 40 },
  input: {
    backgroundColor: '#f5f5f5',
    borderRadius: 12,
    padding: 14,
    fontSize: 15,
    color: '#333',
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  boton: {
    backgroundColor: '#1B4D3E',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 8,
  },
  botonDesactivado: { opacity: 0.6 },
  botonTexto: { color: '#fff', fontSize: 16, fontWeight: '700' },
  inputContenedor: {
  flexDirection: 'row',
  alignItems: 'center',
  backgroundColor: '#f5f5f5',
  borderRadius: 12,
  borderWidth: 1,
  borderColor: '#e0e0e0',
  marginBottom: 14,
},
inputPassword: {
  flex: 1,
  padding: 14,
  fontSize: 15,
  color: '#333',
},
ojito: {
  paddingHorizontal: 14,
},
});
