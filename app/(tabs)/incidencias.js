import { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Alert, ScrollView, ActivityIndicator, Image } from 'react-native';
import { supabase } from '../../lib/supabase';
import * as ImagePicker from 'expo-image-picker';
import * as FileSystem from 'expo-file-system/legacy'; // Usamos legacy como antes
import { decode } from 'base64-arraybuffer';

export default function Incidencias() {
  const [titulo, setTitulo] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [imagenLocal, setImagenLocal] = useState(null);
  const [enviando, setEnviando] = useState(false);
  const [enviado, setEnviado] = useState(false);

  async function seleccionarImagen() {
    const resultado = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      quality: 0.6, // Bajamos un poco la calidad para que pese menos
    });

    if (!resultado.canceled) {
      setImagenLocal(resultado.assets[0]);
    }
  }

  async function subirImagen(asset) {
    const base64 = await FileSystem.readAsStringAsync(asset.uri, {
      encoding: FileSystem.EncodingType.Base64,
    });
    const arrayBuffer = decode(base64);
    const ext = asset.uri.split('.').pop().toLowerCase();
    const nombreArchivo = `${Date.now()}.${ext}`;
    const rutaArchivo = `incidencias/${nombreArchivo}`; // Carpeta diferente a noticias

    const { error } = await supabase.storage
      .from('imagenes')
      .upload(rutaArchivo, arrayBuffer, {
        contentType: `image/${ext === 'jpg' ? 'jpeg' : ext}`,
      });

    if (error) throw error;

    const { data: { publicUrl } } = supabase.storage.from('imagenes').getPublicUrl(rutaArchivo);
    return publicUrl;
  }

  async function enviarIncidencia() {
    if (!titulo.trim() || !descripcion.trim()) {
      Alert.alert('Campos vacíos', 'Por favor rellena el título y la descripción.');
      return;
    }

    setEnviando(true);
    try {
      let urlFinal = null;
      if (imagenLocal) {
        urlFinal = await subirImagen(imagenLocal);
      }

      const { error } = await supabase
        .from('incidencias')
        .insert([{
          titulo: titulo.trim(),
          descripcion: descripcion.trim(),
          estado: 'pendiente',
          imagen_url: urlFinal
        }]);

      if (error) throw error;
      setEnviado(true);
    } catch (error) {
      Alert.alert('Error', 'No se pudo enviar la incidencia.');
      console.error(error);
    } finally {
      setEnviando(false);
    }
  }

  if (enviado) {
    return (
      <View style={styles.centrado}>
        <Text style={styles.checkmark}>✅</Text>
        <Text style={styles.gracias}>¡Incidencia enviada!</Text>
        <TouchableOpacity style={styles.botonOtra} onPress={() => { setEnviado(false); setImagenLocal(null); setTitulo(''); setDescripcion(''); }}>
          <Text style={styles.botonOtraTexto}>Enviar otra incidencia</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contenido}>
      <Text style={styles.titulo}>Reportar una incidencia</Text>

      <TextInput style={styles.input} placeholder="Título (ej: Farola rota)" value={titulo} onChangeText={setTitulo} />

      <TextInput
        style={styles.textarea}
        placeholder="Descripción detallada..."
        multiline
        value={descripcion}
        onChangeText={setDescripcion}
      />

      <TouchableOpacity style={styles.botonImagen} onPress={seleccionarImagen}>
        {imagenLocal ? (
          <Image source={{ uri: imagenLocal.uri }} style={styles.preview} />
        ) : (
          <Text style={styles.botonImagenTexto}>📷 Adjuntar foto (opcional)</Text>
        )}
      </TouchableOpacity>

      <TouchableOpacity style={[styles.boton, enviando && styles.botonDesactivado]} onPress={enviarIncidencia} disabled={enviando}>
        {enviando ? <ActivityIndicator color="#fff" /> : <Text style={styles.botonTexto}>Enviar incidencia</Text>}
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  contenido: { padding: 20 },
  centrado: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 40 },
  checkmark: { fontSize: 64, marginBottom: 16 },
  gracias: { fontSize: 22, fontWeight: '800', marginBottom: 32 },
  titulo: { fontSize: 22, fontWeight: '800', marginBottom: 20 },
  input: { backgroundColor: '#fff', borderRadius: 12, padding: 14, marginBottom: 16, borderWidth: 1, borderColor: '#e0e0e0' },
  textarea: { backgroundColor: '#fff', borderRadius: 12, padding: 14, minHeight: 120, marginBottom: 16, borderWidth: 1, borderColor: '#e0e0e0' },
  botonImagen: { backgroundColor: '#fff', height: 120, borderRadius: 12, borderWidth: 1, borderColor: '#e0e0e0', borderStyle: 'dashed', justifyContent: 'center', alignItems: 'center', marginBottom: 20, overflow: 'hidden' },
  botonImagenTexto: { color: '#666', fontWeight: '600' },
  preview: { width: '100%', height: '100%' },
  boton: { backgroundColor: '#C0392B', borderRadius: 12, paddingVertical: 16, alignItems: 'center' },
  botonDesactivado: { opacity: 0.6 },
  botonTexto: { color: '#fff', fontSize: 16, fontWeight: '700' },
  botonOtra: { padding: 15 },
  botonOtraTexto: { color: '#C0392B', fontWeight: '700' }
});
