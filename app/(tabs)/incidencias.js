import { useState } from 'react';
import {
  View, Text, StyleSheet, TextInput, TouchableOpacity,
  Alert, ScrollView, ActivityIndicator, Image,
  KeyboardAvoidingView, Platform
} from 'react-native';
import { supabase } from '../../lib/supabase';
import * as ImagePicker from 'expo-image-picker';
// CAMBIO CLAVE: Importamos desde /legacy para que readAsStringAsync funcione
import * as FileSystem from 'expo-file-system/legacy';
import { decode } from 'base64-arraybuffer';
import { Ionicons } from '@expo/vector-icons';
import { Stack } from 'expo-router';

export default function Incidencias() {
  const [titulo, setTitulo] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [contacto, setContacto] = useState('');
  const [imagenLocal, setImagenLocal] = useState(null);
  const [enviando, setEnviando] = useState(false);
  const [enviado, setEnviado] = useState(false);

  async function seleccionarImagen() {
    const resultado = await ImagePicker.launchImageLibraryAsync({
      // CAMBIO CLAVE: Nueva forma de poner los tipos (array de strings)
      mediaTypes: ['images'],
      allowsEditing: true,
      quality: 0.5,
    });

    if (!resultado.canceled) {
      setImagenLocal(resultado.assets[0]);
    }
  }

  async function subirImagen(asset) {
    try {
      const base64 = await FileSystem.readAsStringAsync(asset.uri, {
        encoding: FileSystem.EncodingType.Base64,
      });
      const arrayBuffer = decode(base64);
      const ext = asset.uri.split('.').pop().toLowerCase();
      const nombreArchivo = `${Date.now()}.${ext}`;
      const rutaArchivo = `incidencias/${nombreArchivo}`;

      const { error } = await supabase.storage
        .from('imagenes')
        .upload(rutaArchivo, arrayBuffer, {
          contentType: `image/${ext === 'jpg' ? 'jpeg' : ext}`,
        });

      if (error) throw error;

      const { data: { publicUrl } } = supabase.storage.from('imagenes').getPublicUrl(rutaArchivo);
      return publicUrl;
    } catch (e) {
      console.error("Error subiendo imagen:", e);
      throw e;
    }
  }

  async function enviarIncidencia() {
    if (!titulo.trim() || !descripcion.trim()) {
      Alert.alert('Atención', 'Dinos al menos qué pasa y una breve descripción.');
      return;
    }

    setEnviando(true);
    try {
      let urlFinal = null;
      if (imagenLocal) {
        urlFinal = await subirImagen(imagenLocal);
      }

      // IMPORTANTE: Asegúrate de que en Supabase la tabla 'incidencias'
      // tenga las columnas: titulo, descripcion, contacto, estado, imagen_url
      const { error } = await supabase
        .from('incidencias')
        .insert([{
          titulo: titulo.trim(),
          descripcion: descripcion.trim(),
          contacto: contacto.trim(), // Si no tienes esta columna en Supabase, borra esta línea
          estado: 'pendiente',
          imagen_url: urlFinal,
        }]);

      if (error) throw error;
      setEnviado(true);
    } catch (error) {
      Alert.alert('Error', 'No se pudo enviar. Comprueba que la tabla en Supabase tenga todos los campos.');
      console.error(error);
    } finally {
      setEnviando(false);
    }
  }

  if (enviado) {
    return (
      <View style={styles.centradoExito}>
        <View style={styles.circuloExito}>
          <Ionicons name="checkmark-outline" size={60} color="#fff" />
        </View>
        <Text style={styles.gracias}>¡Incidencia enviada!</Text>
        <Text style={styles.subGracias}>Gracias por colaborar para que el pueblo esté mejor.</Text>
        <TouchableOpacity
          style={styles.botonReintentar}
          onPress={() => { setEnviado(false); setImagenLocal(null); setTitulo(''); setDescripcion(''); setContacto(''); }}
        >
          <Text style={styles.botonReintentarTexto}>Enviar otra incidencia</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={{ flex: 1 }}
    >
      <Stack.Screen options={{
        title: 'Reportar Incidencia',
        headerStyle: { backgroundColor: '#C0392B' },
        headerTintColor: '#fff',
        headerTitleStyle: { fontWeight: 'bold' }
      }} />

      <ScrollView style={styles.container} contentContainerStyle={styles.contenido}>
        <Text style={styles.instrucciones}>
          Utiliza este formulario para avisar de desperfectos o averías en el municipio.
        </Text>

        <View style={styles.card}>
          <Text style={styles.label}>¿Qué sucede?</Text>
          <TextInput
            style={styles.input}
            placeholder="Ej: Farola rota, bache en el camino..."
            value={titulo}
            onChangeText={setTitulo}
          />

          <Text style={styles.label}>Descripción y ubicación</Text>
          <TextInput
            style={styles.textarea}
            placeholder="Danos más detalles para poder arreglarlo..."
            multiline
            value={descripcion}
            onChangeText={setDescripcion}
          />

          <Text style={styles.label}>Teléfono o nombre (opcional)</Text>
          <TextInput
            style={styles.input}
            placeholder="Por si necesitamos contactar contigo"
            value={contacto}
            onChangeText={setContacto}
            keyboardType="phone-pad"
          />
        </View>

        <Text style={styles.label}>Adjuntar fotografía</Text>
        <TouchableOpacity style={styles.botonImagen} onPress={seleccionarImagen}>
          {imagenLocal ? (
            <View style={{ width: '100%', height: '100%' }}>
              <Image source={{ uri: imagenLocal.uri }} style={styles.preview} />
              <View style={styles.badgeCambiar}>
                <Ionicons name="camera" size={20} color="white" />
                <Text style={{ color: 'white', fontWeight: 'bold', marginLeft: 5 }}>Cambiar</Text>
              </View>
            </View>
          ) : (
            <View style={{ alignItems: 'center' }}>
              <Ionicons name="camera-outline" size={40} color="#999" />
              <Text style={styles.botonImagenTexto}>Hacer o adjuntar foto</Text>
            </View>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.botonEnviar, enviando && styles.botonDesactivado]}
          onPress={enviarIncidencia}
          disabled={enviando}
        >
          {enviando ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <>
              <Ionicons name="send" size={20} color="#fff" style={{ marginRight: 10 }} />
              <Text style={styles.botonTexto}>Enviar</Text>
            </>
          )}
        </TouchableOpacity>

        <View style={{ height: 40 }} />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8f9fa' },
  contenido: { padding: 20 },
  instrucciones: { fontSize: 15, color: '#666', marginBottom: 20, lineHeight: 22 },
  card: { backgroundColor: '#fff', borderRadius: 16, padding: 16, marginBottom: 20, elevation: 2, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 5, borderWidth: 1, borderColor: '#eee' },
  label: { fontSize: 14, fontWeight: '700', color: '#333', marginBottom: 8, marginLeft: 4 },
  input: { backgroundColor: '#f1f3f5', borderRadius: 10, padding: 14, fontSize: 15, marginBottom: 16 },
  textarea: { backgroundColor: '#f1f3f5', borderRadius: 10, padding: 14, fontSize: 15, minHeight: 100, textAlignVertical: 'top' },
  botonImagen: { backgroundColor: '#fff', height: 160, borderRadius: 16, borderWidth: 2, borderColor: '#ddd', borderStyle: 'dashed', justifyContent: 'center', alignItems: 'center', marginBottom: 25, overflow: 'hidden' },
  botonImagenTexto: { color: '#999', fontWeight: '600', marginTop: 10 },
  preview: { width: '100%', height: '100%' },
  badgeCambiar: { position: 'absolute', bottom: 10, right: 10, backgroundColor: 'rgba(0,0,0,0.6)', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20, flexDirection: 'row', alignItems: 'center' },
  botonEnviar: { backgroundColor: '#C0392B', borderRadius: 16, paddingVertical: 18, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', elevation: 4 },
  botonDesactivado: { opacity: 0.6 },
  botonTexto: { color: '#fff', fontSize: 17, fontWeight: '800' },
  centradoExito: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 40, backgroundColor: '#fff' },
  circuloExito: { width: 100, height: 100, borderRadius: 50, backgroundColor: '#27AE60', alignItems: 'center', justifyContent: 'center', marginBottom: 20 },
  gracias: { fontSize: 24, fontWeight: '800', color: '#333', marginBottom: 10 },
  subGracias: { fontSize: 16, color: '#666', textAlign: 'center', marginBottom: 30, lineHeight: 24 },
  botonReintentar: { padding: 15 },
  botonReintentarTexto: { color: '#C0392B', fontWeight: '700', fontSize: 16 }
});
