import { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Alert, ScrollView, ActivityIndicator } from 'react-native';
import { supabase } from '../../lib/supabase';

export default function Incidencias() {
  const [descripcion, setDescripcion] = useState('');
  const [enviando, setEnviando] = useState(false);
  const [enviado, setEnviado] = useState(false);
  const [titulo, setTitulo] = useState('');

  async function enviarIncidencia() {
    if (!titulo.trim() || !descripcion.trim()) {
      Alert.alert('Campos vacíos', 'Por favor rellena el título y la descripción.');
      return;
    }

    setEnviando(true);
    const { error } = await supabase
      .from('incidencias')
      .insert([{ titulo: titulo.trim(), descripcion: descripcion.trim(), estado: 'pendiente' }]);

    if (error) {
      Alert.alert('Error', 'No se pudo enviar la incidencia. Inténtalo de nuevo.');
      console.error(error);
    } else {
      setEnviado(true);
      setTitulo('');
      setDescripcion('');
    }
    setEnviando(false);
  }

  if (enviado) {
    return (
      <View style={styles.centrado}>
        <Text style={styles.checkmark}>✅</Text>
        <Text style={styles.gracias}>¡Incidencia enviada!</Text>
        <Text style={styles.graciasSub}>Gracias por avisar. La revisaremos lo antes posible.</Text>
        <TouchableOpacity style={styles.botonOtra} onPress={() => setEnviado(false)}>
          <Text style={styles.botonOtraTexto}>Enviar otra incidencia</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contenido}>
      <Text style={styles.titulo}>Reportar una incidencia</Text>
      <Text style={styles.subtitulo}>
        ¿Has visto algún problema en el pueblo? Cuéntanos y lo atenderemos lo antes posible.
      </Text>

      <View style={styles.campo}>
        <Text style={styles.label}>Título</Text>
        <TextInput
          style={styles.input}
          placeholder="Ej: Farola rota"
          placeholderTextColor="#aaa"
          value={titulo}
          onChangeText={setTitulo}
          maxLength={100}
        />
      </View>

      <View style={styles.campo}>
        <Text style={styles.label}>Descripción del problema</Text>
        <TextInput
          style={styles.textarea}
          placeholder="Ej: Hay una farola rota..."
          placeholderTextColor="#aaa"
          multiline
          numberOfLines={6}
          textAlignVertical="top"
          value={descripcion}
          onChangeText={setDescripcion}
          maxLength={500}
        />
        <Text style={styles.contador}>{descripcion.length}/500</Text>
      </View>

      <TouchableOpacity
        style={[styles.boton, enviando && styles.botonDesactivado]}
        onPress={enviarIncidencia}
        disabled={enviando}
      >
        {enviando ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.botonTexto}>Enviar incidencia</Text>
        )}
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  contenido: { padding: 20 },
  centrado: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 40 },
  checkmark: { fontSize: 64, marginBottom: 16 },
  gracias: { fontSize: 22, fontWeight: '800', color: '#1a1a1a', marginBottom: 8, textAlign: 'center' },
  graciasSub: { fontSize: 15, color: '#666', textAlign: 'center', lineHeight: 22, marginBottom: 32 },
  botonOtra: { borderWidth: 2, borderColor: '#C0392B', borderRadius: 12, paddingVertical: 12, paddingHorizontal: 24 },
  botonOtraTexto: { color: '#C0392B', fontWeight: '700', fontSize: 15 },
  titulo: { fontSize: 22, fontWeight: '800', color: '#1a1a1a', marginBottom: 8 },
  subtitulo: { fontSize: 14, color: '#666', lineHeight: 21, marginBottom: 28 },
  campo: { marginBottom: 20 },
  label: { fontSize: 14, fontWeight: '700', color: '#333', marginBottom: 8 },
  textarea: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 14,
    fontSize: 15,
    color: '#333',
    minHeight: 140,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  contador: { fontSize: 12, color: '#999', textAlign: 'right', marginTop: 4 },
  boton: {
    backgroundColor: '#C0392B',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 8,
  },
  botonDesactivado: { opacity: 0.6 },
  botonTexto: { color: '#fff', fontSize: 16, fontWeight: '700' },
  input: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 14,
    fontSize: 15,
    color: '#333',
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
});
