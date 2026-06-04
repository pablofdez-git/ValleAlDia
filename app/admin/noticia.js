import { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Alert, ScrollView, ActivityIndicator, KeyboardAvoidingView, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { supabase } from '../../lib/supabase';

export default function NuevaNoticia() {
  const [titulo, setTitulo] = useState('');
  const [contenido, setContenido] = useState('');
  const [imagenUrl, setImagenUrl] = useState('');
  const [enviando, setEnviando] = useState(false);
  const router = useRouter();

  async function publicar() {
    if (!titulo.trim() || !contenido.trim()) {
      Alert.alert('Campos vacíos', 'El título y el contenido son obligatorios.');
      return;
    }
    setEnviando(true);
    const { error } = await supabase.from('noticias').insert([{
      titulo: titulo.trim(),
      contenido: contenido.trim(),
      imagen_url: imagenUrl.trim() || null,
    }]);
    if (error) {
      Alert.alert('Error', 'No se pudo publicar la noticia.');
    } else {
      Alert.alert('¡Publicada!', 'La noticia ya es visible para todos.', [
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
      <Text style={styles.titulo}>Nueva noticia</Text>

      <Text style={styles.label}>Título *</Text>
      <TextInput style={styles.input} placeholder="Título de la noticia" placeholderTextColor="#aaa" value={titulo} onChangeText={setTitulo} />

      <Text style={styles.label}>Contenido *</Text>
      <TextInput style={styles.textarea} placeholder="Escribe el contenido..." placeholderTextColor="#aaa" multiline numberOfLines={8} textAlignVertical="top" value={contenido} onChangeText={setContenido} />

      <Text style={styles.label}>URL de imagen (opcional)</Text>
      <TextInput style={styles.input} placeholder="https://..." placeholderTextColor="#aaa" value={imagenUrl} onChangeText={setImagenUrl} autoCapitalize="none" />

      <TouchableOpacity style={[styles.boton, enviando && styles.botonDesactivado]} onPress={publicar} disabled={enviando}>
        {enviando ? <ActivityIndicator color="#fff" /> : <Text style={styles.botonTexto}>Publicar noticia</Text>}
      </TouchableOpacity>
    </ScrollView>
  </KeyboardAvoidingView>
);
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  contenido: { padding: 20, paddingTop: 40},
  titulo: { fontSize: 22, fontWeight: '800', color: '#1a1a1a', marginBottom: 24 },
  label: { fontSize: 14, fontWeight: '700', color: '#333', marginBottom: 8 },
  input: { backgroundColor: '#fff', borderRadius: 12, padding: 14, fontSize: 15, color: '#333', marginBottom: 16, borderWidth: 1, borderColor: '#e0e0e0' },
  textarea: { backgroundColor: '#fff', borderRadius: 12, padding: 14, fontSize: 15, color: '#333', marginBottom: 16, borderWidth: 1, borderColor: '#e0e0e0', minHeight: 180 },
  boton: { backgroundColor: '#1B4D3E', borderRadius: 12, paddingVertical: 16, alignItems: 'center', marginTop: 8 },
  botonDesactivado: { opacity: 0.6 },
  botonTexto: { color: '#fff', fontSize: 16, fontWeight: '700' },
});
