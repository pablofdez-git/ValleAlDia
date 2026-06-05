import { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator, TouchableOpacity, Alert, TextInput, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { supabase } from '../../lib/supabase';

export default function GestionarComarca() {
  const [eventos, setEventos] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [editando, setEditando] = useState(null);
  const [titulo, setTitulo] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [fecha, setFecha] = useState('');
  const [lugar, setLugar] = useState('');
  const [pueblo, setPueblo] = useState('');
  const [guardando, setGuardando] = useState(false);

  useEffect(() => { cargar(); }, []);

  async function cargar() {
    setCargando(true);
    const { data, error } = await supabase.from('eventos_comarca').select('*').order('fecha', { ascending: true });
    if (error) console.error(error);
    else setEventos(data);
    setCargando(false);
  }

  function abrirEditar(item) {
    setEditando(item);
    setTitulo(item.titulo);
    setDescripcion(item.descripcion);
    setFecha(item.fecha);
    setLugar(item.lugar);
    setPueblo(item.pueblo);
  }

  function cancelarEditar() {
    setEditando(null);
    setTitulo('');
    setDescripcion('');
    setFecha('');
    setLugar('');
    setPueblo('');
  }

  async function guardar() {
    if (!titulo.trim() || !descripcion.trim() || !fecha.trim() || !lugar.trim() || !pueblo.trim()) {
      Alert.alert('Campos vacíos', 'Todos los campos son obligatorios.');
      return;
    }
    if (!/^\d{4}-\d{2}-\d{2}$/.test(fecha)) {
      Alert.alert('Fecha incorrecta', 'Usa el formato AAAA-MM-DD.');
      return;
    }
    setGuardando(true);
    const { error } = await supabase.from('eventos_comarca').update({
      titulo: titulo.trim(),
      descripcion: descripcion.trim(),
      fecha: fecha.trim(),
      lugar: lugar.trim(),
      pueblo: pueblo.trim(),
    }).eq('id', editando.id);
    if (error) {
      Alert.alert('Error', 'No se pudo guardar.');
    } else {
      cancelarEditar();
      cargar();
    }
    setGuardando(false);
  }

  async function eliminar(id) {
    Alert.alert('Eliminar', '¿Seguro que quieres eliminar este evento?', [
      {
        text: 'Eliminar', style: 'destructive', onPress: async () => {
          await supabase.from('eventos_comarca').delete().eq('id', id);
          cargar();
        }
      },
      { text: 'Cancelar', style: 'cancel' }
    ]);
  }

  if (editando) {
    return (
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <ScrollView style={styles.container} contentContainerStyle={styles.contenido} keyboardShouldPersistTaps="handled">
          <Text style={styles.tituloSeccion}>Editando evento comarca</Text>
          <Text style={styles.label}>Pueblo *</Text>
          <TextInput style={styles.input} value={pueblo} onChangeText={setPueblo} placeholderTextColor="#aaa" />
          <Text style={styles.label}>Título *</Text>
          <TextInput style={styles.input} value={titulo} onChangeText={setTitulo} placeholderTextColor="#aaa" />
          <Text style={styles.label}>Descripción *</Text>
          <TextInput style={styles.textarea} value={descripcion} onChangeText={setDescripcion} multiline numberOfLines={6} textAlignVertical="top" placeholderTextColor="#aaa" />
          <Text style={styles.label}>Fecha * (AAAA-MM-DD)</Text>
          <TextInput style={styles.input} value={fecha} onChangeText={setFecha} keyboardType="numeric" placeholderTextColor="#aaa" />
          <Text style={styles.label}>Lugar *</Text>
          <TextInput style={styles.input} value={lugar} onChangeText={setLugar} placeholderTextColor="#aaa" />
          <TouchableOpacity style={[styles.boton, { backgroundColor: '#6C3483' }, guardando && { opacity: 0.6 }]} onPress={guardar} disabled={guardando}>
            {guardando ? <ActivityIndicator color="#fff" /> : <Text style={styles.botonTexto}>Guardar cambios</Text>}
          </TouchableOpacity>
          <TouchableOpacity style={styles.botonCancelar} onPress={cancelarEditar}>
            <Text style={styles.botonCancelarTexto}>Cancelar</Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    );
  }

  if (cargando) return <View style={styles.centrado}><ActivityIndicator size="large" color="#6C3483" /></View>;
  if (eventos.length === 0) return <View style={styles.centrado}><Text style={styles.vacio}>No hay eventos de comarca</Text></View>;

  return (
    <FlatList
      data={eventos}
      keyExtractor={(item) => item.id.toString()}
      contentContainerStyle={styles.lista}
      renderItem={({ item }) => (
        <View style={styles.tarjeta}>
          <View style={styles.puebloTag}>
            <Text style={styles.puebloTexto}>📍 {item.pueblo}</Text>
          </View>
          <Text style={styles.itemTitulo} numberOfLines={2}>{item.titulo}</Text>
          <Text style={styles.itemFecha}>📅 {item.fecha} · {item.lugar}</Text>
          <View style={styles.botones}>
            <TouchableOpacity style={[styles.botonAccion, { backgroundColor: '#6C3483' }]} onPress={() => abrirEditar(item)}>
              <Text style={styles.botonAccionTexto}>Editar</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.botonAccion, { backgroundColor: '#C0392B' }]} onPress={() => eliminar(item.id)}>
              <Text style={styles.botonAccionTexto}>Eliminar</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    />
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  contenido: { padding: 20, paddingTop: 40 },
  lista: { padding: 16, paddingTop: 40, gap: 12 },
  centrado: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  vacio: { fontSize: 16, color: '#999' },
  tituloSeccion: { fontSize: 22, fontWeight: '800', color: '#1a1a1a', marginBottom: 24 },
  label: { fontSize: 14, fontWeight: '700', color: '#333', marginBottom: 8 },
  input: { backgroundColor: '#fff', borderRadius: 12, padding: 14, fontSize: 15, color: '#333', marginBottom: 16, borderWidth: 1, borderColor: '#e0e0e0' },
  textarea: { backgroundColor: '#fff', borderRadius: 12, padding: 14, fontSize: 15, color: '#333', marginBottom: 16, borderWidth: 1, borderColor: '#e0e0e0', minHeight: 140 },
  boton: { borderRadius: 12, paddingVertical: 16, alignItems: 'center', marginTop: 8 },
  botonTexto: { color: '#fff', fontSize: 16, fontWeight: '700' },
  botonCancelar: { borderWidth: 2, borderColor: '#ccc', borderRadius: 12, paddingVertical: 14, alignItems: 'center', marginTop: 12 },
  botonCancelarTexto: { color: '#666', fontWeight: '700', fontSize: 15 },
  tarjeta: { backgroundColor: '#fff', borderRadius: 12, padding: 16, elevation: 3, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.08, shadowRadius: 8 },
  puebloTag: { backgroundColor: '#f0e8f5', borderRadius: 6, paddingHorizontal: 8, paddingVertical: 3, alignSelf: 'flex-start', marginBottom: 6 },
  puebloTexto: { fontSize: 12, color: '#6C3483', fontWeight: '700' },
  itemTitulo: { fontSize: 16, fontWeight: '700', color: '#1a1a1a', marginBottom: 4 },
  itemFecha: { fontSize: 12, color: '#999', marginBottom: 12 },
  botones: { flexDirection: 'row', gap: 8 },
  botonAccion: { flex: 1, borderRadius: 8, paddingVertical: 10, alignItems: 'center' },
  botonAccionTexto: { color: '#fff', fontWeight: '700', fontSize: 13 },
});
