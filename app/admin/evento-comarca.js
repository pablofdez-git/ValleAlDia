import { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Alert, ScrollView, ActivityIndicator, KeyboardAvoidingView, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { supabase } from '../../lib/supabase';

export default function NuevoEventoComarca() {
  const [titulo, setTitulo] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [fecha, setFecha] = useState('');
  const [lugar, setLugar] = useState('');
  const [pueblo, setPueblo] = useState('');
  const [enviando, setEnviando] = useState(false);
  const router = useRouter();

  async function publicar() {
    if (!titulo.trim() || !descripcion.trim() || !fecha.trim() || !lugar.trim() || !pueblo.trim()) {
      Alert.alert('Campos vacíos', 'Todos los campos son obligatorios.');
      return;
    }
    if (!/^\d{4}-\d{2}-\d{2}$/.test(fecha)) {
      Alert.alert('Fecha incorrecta', 'Usa el formato AAAA-MM-DD. Ej: 2026-07-15');
      return;
    }
    setEnviando(true);
    const { error } = await supabase.from('eventos_comarca').insert([{
      titulo: titulo.trim(),
      descripcion: descripcion.trim(),
      fecha: fecha.trim(),
      lugar: lugar.trim(),
      pueblo: pueblo.trim(),
    }]);
    if (error) {
      Alert.alert('Error', 'No se pudo publicar el evento.');
    } else {
      Alert.alert('¡Publicado!', 'El evento ya es visible para todos.', [
        { text: 'OK', onPress: () => router.back() }
      ]);
    }
    setEnviando(false);
  }

  return (
  <KeyboardAvoidingView
    style={{ flex: 1 }}
    behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
  >
    <ScrollView style={styles.container} contentContainerStyle={styles.contenido}>
      <Text style={styles.titulo}>Nuevo evento comarca</Text>

      <Text style={styles.label}>Pueblo *</Text>
      <TextInput style={styles.input} placeholder="Ej: Saldaña" placeholderTextColor="#aaa" value={pueblo} onChangeText={setPueblo} />

      <Text style={styles.label}>Título *</Text>
      <TextInput style={styles.input} placeholder="Título del evento" placeholderTextColor="#aaa" value={titulo} onChangeText={setTitulo} />

      <Text style={styles.label}>Descripción *</Text>
      <TextInput style={styles.textarea} placeholder="Describe el evento..." placeholderTextColor="#aaa" multiline numberOfLines={6} textAlignVertical="top" value={descripcion} onChangeText={setDescripcion} />

      <Text style={styles.label}>Fecha * (AAAA-MM-DD)</Text>
      <TextInput style={styles.input} placeholder="2026-07-15" placeholderTextColor="#aaa" value={fecha} onChangeText={setFecha} keyboardType="numeric" />

      <Text style={styles.label}>Lugar *</Text>
      <TextInput style={styles.input} placeholder="Ej: Plaza del Ayuntamiento" placeholderTextColor="#aaa" value={lugar} onChangeText={setLugar} />

      <TouchableOpacity style={[styles.boton, enviando && styles.botonDesactivado]} onPress={publicar} disabled={enviando}>
        {enviando ? <ActivityIndicator color="#fff" /> : <Text style={styles.botonTexto}>Publicar evento</Text>}
      </TouchableOpacity>
    </ScrollView>
  </KeyboardAvoidingView>
);

}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  contenido: { padding: 20, paddingTop: 40 },
  titulo: { fontSize: 22, fontWeight: '800', color: '#1a1a1a', marginBottom: 24 },
  label: { fontSize: 14, fontWeight: '700', color: '#333', marginBottom: 8 },
  input: { backgroundColor: '#fff', borderRadius: 12, padding: 14, fontSize: 15, color: '#333', marginBottom: 16, borderWidth: 1, borderColor: '#e0e0e0' },
  textarea: { backgroundColor: '#fff', borderRadius: 12, padding: 14, fontSize: 15, color: '#333', marginBottom: 16, borderWidth: 1, borderColor: '#e0e0e0', minHeight: 140 },
  boton: { backgroundColor: '#6C3483', borderRadius: 12, paddingVertical: 16, alignItems: 'center', marginTop: 8 },
  botonDesactivado: { opacity: 0.6 },
  botonTexto: { color: '#fff', fontSize: 16, fontWeight: '700' },
});
