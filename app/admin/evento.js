import { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Alert, ScrollView, ActivityIndicator, KeyboardAvoidingView, Platform } from 'react-native';
import { useRouter, Stack } from 'expo-router';
import { supabase } from '../../lib/supabase';

export default function NuevoEvento() {
  const [form, setForm] = useState({ titulo: '', descripcion: '', fecha: '', hora: '', lugar: '' });
  const [enviando, setEnviando] = useState(false);
  const router = useRouter();

  const actualizar = (campo, valor) => setForm({ ...form, [campo]: valor });

  // FUNCIÓN PARA CONVERTIR DD-MM-AAAA a AAAA-MM-DD
  const prepararFechaParaDB = (fechaLatina) => {
    const partes = fechaLatina.split('-'); // Divide 15-07-2026
    if (partes.length !== 3) return null;
    return `${partes[2]}-${partes[1]}-${partes[0]}`; // Devuelve 2026-07-15
  };

  async function publicar() {
    const { titulo, descripcion, fecha, hora, lugar } = form;

    if (!titulo.trim() || !descripcion.trim() || !fecha.trim() || !lugar.trim() || !hora.trim()) {
      Alert.alert('Campos vacíos', 'Todos los campos son obligatorios.');
      return;
    }

    // Validamos que el formato sea DD-MM-AAAA
    if (!/^\d{2}-\d{2}-\d{4}$/.test(fecha)) {
      Alert.alert('Fecha incorrecta', 'Usa el formato DD-MM-AAAA. Ej: 15-07-2026');
      return;
    }

    const fechaConvertida = prepararFechaParaDB(fecha);

    setEnviando(true);
    const { error } = await supabase.from('eventos').insert([{
      ...form,
      fecha: fechaConvertida // Enviamos la fecha que la DB entiende
    }]);

    if (error) {
      Alert.alert('Error', 'No se pudo publicar el evento.');
    } else {
      Alert.alert('¡Publicado!', 'El evento ya es visible.', [{ text: 'OK', onPress: () => router.back() }]);
    }
    setEnviando(false);
  }

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <Stack.Screen options={{ title: 'Nuevo Evento', headerStyle: { backgroundColor: '#1A5276' }, headerTintColor: '#fff' }} />
      <ScrollView style={styles.container} contentContainerStyle={styles.contenido}>
        <View style={styles.card}>
          <Text style={styles.label}>Título del evento *</Text>
          <TextInput style={styles.input} placeholder="Ej: Cine de verano" value={form.titulo} onChangeText={(v) => actualizar('titulo', v)} />

          <Text style={styles.label}>Descripción *</Text>
          <TextInput style={styles.textarea} placeholder="Describe el evento..." multiline value={form.descripcion} onChangeText={(v) => actualizar('descripcion', v)} />

          <View style={styles.fila}>
            <View style={{ flex: 1, marginRight: 10 }}>
              <Text style={styles.label}>Fecha (DD-MM-AAAA)</Text>
              <TextInput
                style={styles.input}
                placeholder="15-07-2026"
                value={form.fecha}
                onChangeText={(v) => actualizar('fecha', v)}
                keyboardType="numeric"
              />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.label}>Hora</Text>
              <TextInput style={styles.input} placeholder="Ej: 22:00" value={form.hora} onChangeText={(v) => actualizar('hora', v)} />
            </View>
          </View>

          <Text style={styles.label}>Lugar *</Text>
          <TextInput style={styles.input} placeholder="Ej: Patio de las escuelas" value={form.lugar} onChangeText={(v) => actualizar('lugar', v)} />
        </View>

        <TouchableOpacity style={styles.boton} onPress={publicar} disabled={enviando}>
          {enviando ? <ActivityIndicator color="#fff" /> : <Text style={styles.botonTexto}>Publicar Evento</Text>}
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

// ... (los estilos se mantienen igual)
const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F5F5F5' },
    contenido: { padding: 20 },
    card: { backgroundColor: '#fff', borderRadius: 16, padding: 20, elevation: 3 },
    label: { fontSize: 13, fontWeight: '700', color: '#1A5276', marginBottom: 8 },
    input: { backgroundColor: '#f9f9f9', borderRadius: 10, padding: 14, marginBottom: 16, borderWidth: 1, borderColor: '#eee' },
    textarea: { backgroundColor: '#f9f9f9', borderRadius: 10, padding: 14, marginBottom: 16, borderWidth: 1, borderColor: '#eee', minHeight: 100, textAlignVertical: 'top' },
    fila: { flexDirection: 'row' },
    boton: { backgroundColor: '#1A5276', borderRadius: 12, paddingVertical: 16, alignItems: 'center', marginTop: 20 },
    botonTexto: { color: '#fff', fontSize: 16, fontWeight: '800' },
  });
