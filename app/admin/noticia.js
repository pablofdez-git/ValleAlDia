import { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Alert, ScrollView, ActivityIndicator, KeyboardAvoidingView, Platform, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { supabase } from '../../lib/supabase';
import * as ImagePicker from 'expo-image-picker';
import * as FileSystem from 'expo-file-system';
import { decode } from 'base64-arraybuffer';

export default function NuevaNoticia() {
  const [titulo, setTitulo] = useState('');
  const [contenido, setContenido] = useState('');
  const [imagenLocal, setImagenLocal] = useState(null);
  const [enviando, setEnviando] = useState(false);
  const router = useRouter();

  async function seleccionarImagen() {
    const resultado = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [16, 9],
      quality: 0.7,
    });
    if (!resultado.canceled) setImagenLocal(resultado.assets[0]);
  }

  async function subirImagen(asset) {
    try {
      const base64 = await FileSystem.readAsStringAsync(asset.uri, {
        encoding: FileSystem.EncodingType.Base64,
      });
      const arrayBuffer = decode(base64);
      const ext = asset.uri.split('.').pop().toLowerCase();
      const nombreArchivo = `${Date.now()}.${ext}`;
      const rutaArchivo = `noticias/${nombreArchivo}`;
      const contentType = `image/${ext === 'jpg' || ext === 'jpeg' ? 'jpeg' : 'png'}`;
      const { error } = await supabase.storage.from('imagenes').upload(rutaArchivo, arrayBuffer, { contentType });
      if (error) throw error;
      const { data: { publicUrl } } = supabase.storage.from('imagenes').getPublicUrl(rutaArchivo);
      return publicUrl;
    } catch (err) {
      console.error("Error en subirImagen:", err);
      throw err;
    }
  }

  async function publicar() {
    if (!titulo.trim() || !contenido.trim()) {
      Alert.alert('Campos vacíos', 'El título y el contenido son obligatorios.');
      return;
    }
    setEnviando(true);
    try {
      let urlFinal = null;
      if (imagenLocal) urlFinal = await subirImagen(imagenLocal);
      const { error } = await supabase.from('noticias').insert([{
        titulo: titulo.trim(),
        contenido: contenido.trim(),
        imagen_url: urlFinal,
      }]);
      if (error) throw error;
      Alert.alert('¡Publicada!', 'La noticia ya es visible para todos.', [
        { text: 'OK', onPress: () => router.back() }
      ]);
    } catch (error) {
      Alert.alert('Error', 'No se pudo subir la imagen o publicar la noticia.');
    } finally {
      setEnviando(false);
    }
  }

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <ScrollView style={styles.container} contentContainerStyle={styles.contenido}>
        <Text style={styles.titulo}>Nueva noticia</Text>
        <Text style={styles.label}>Título *</Text>
        <TextInput style={styles.input} placeholder="Título de la noticia" placeholderTextColor="#aaa" value={titulo} onChangeText={setTitulo} />
        <Text style={styles.label}>Contenido *</Text>
        <TextInput style={styles.textarea} placeholder="Escribe el contenido..." placeholderTextColor="#aaa" multiline numberOfLines={8} textAlignVertical="top" value={contenido} onChangeText={setContenido} />
        <Text style={styles.label}>Imagen de la noticia</Text>
        <TouchableOpacity style={styles.botonImagen} onPress={seleccionarImagen}>
          {imagenLocal ? (
            <Image source={{ uri: imagenLocal.uri }} style={styles.preview} />
          ) : (
            <Text style={styles.botonImagenTexto}>📸 Seleccionar foto de galería</Text>
          )}
        </TouchableOpacity>
        {imagenLocal && (
          <TouchableOpacity onPress={() => setImagenLocal(null)}>
            <Text style={styles.eliminarFoto}>Quitar foto</Text>
          </TouchableOpacity>
        )}
        <TouchableOpacity style={[styles.boton, enviando && styles.botonDesactivado]} onPress={publicar} disabled={enviando}>
          {enviando ? <ActivityIndicator color="#fff" /> : <Text style={styles.botonTexto}>Publicar noticia</Text>}
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
  textarea: { backgroundColor: '#fff', borderRadius: 12, padding: 14, fontSize: 15, color: '#333', marginBottom: 16, borderWidth: 1, borderColor: '#e0e0e0', minHeight: 180 },
  botonImagen: { backgroundColor: '#fff', height: 150, borderRadius: 12, borderWidth: 1, borderColor: '#e0e0e0', borderStyle: 'dashed', justifyContent: 'center', alignItems: 'center', marginBottom: 10, overflow: 'hidden' },
  botonImagenTexto: { color: '#666', fontWeight: '600' },
  preview: { width: '100%', height: '100%' },
  eliminarFoto: { color: '#C0392B', textAlign: 'center', marginBottom: 20, fontWeight: '600' },
  boton: { backgroundColor: '#1B4D3E', borderRadius: 12, paddingVertical: 16, alignItems: 'center', marginTop: 8 },
  botonDesactivado: { opacity: 0.6 },
  botonTexto: { color: '#fff', fontSize: 16, fontWeight: '700' },
});
