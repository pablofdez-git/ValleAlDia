import { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator } from 'react-native';
import { useLocalSearchParams, Stack } from 'expo-router';
import { supabase } from '../../../lib/supabase';

export default function DetalleComarca() {
  const { id } = useLocalSearchParams();
  const [evento, setEvento] = useState(null);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    async function cargarEvento() {
      const { data, error } = await supabase
        .from('eventos_comarca')
        .select('*')
        .eq('id', id)
        .single();
      if (error) console.error(error);
      else setEvento(data);
      setCargando(false);
    }
    cargarEvento();
  }, [id]);

  if (cargando) {
    return (
      <View style={styles.centrado}>
        <ActivityIndicator size="large" color="#6C3483" />
      </View>
    );
  }

  if (!evento) {
    return (
      <View style={styles.centrado}>
        <Text>Evento no encontrado</Text>
      </View>
    );
  }

  const fecha = new Date(evento.fecha).toLocaleDateString('es-ES', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric'
  });

  return (
    <>
      <Stack.Screen
        options={{
          title: 'Evento comarca',
          headerStyle: { backgroundColor: '#6C3483' },
          headerTintColor: '#fff',
          headerTitleStyle: { fontWeight: 'bold' },
        }}
      />
      <ScrollView style={styles.container} contentContainerStyle={styles.contenido}>
        <View style={styles.puebloTag}>
          <Text style={styles.puebloTexto}>📍 {evento.pueblo}</Text>
        </View>
        <Text style={styles.titulo}>{evento.titulo}</Text>
        <View style={styles.datosBloque}>
          <View style={styles.dato}>
            <Text style={styles.datoIcono}>📅</Text>
            <Text style={styles.datoTexto}>{fecha}</Text>
          </View>
          <View style={styles.dato}>
            <Text style={styles.datoIcono}>📍</Text>
            <Text style={styles.datoTexto}>{evento.lugar}</Text>
          </View>
        </View>
        <View style={styles.separador} />
        <Text style={styles.descripcion}>{evento.descripcion}</Text>
      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  centrado: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  contenido: { padding: 20 },
  puebloTag: {
    backgroundColor: '#f0e8f5',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 6,
    alignSelf: 'flex-start',
    marginBottom: 12,
  },
  puebloTexto: { fontSize: 13, color: '#6C3483', fontWeight: '700' },
  titulo: { fontSize: 24, fontWeight: '800', color: '#1a1a1a', lineHeight: 32, marginBottom: 16 },
  datosBloque: { backgroundColor: '#f5f0f8', borderRadius: 12, padding: 16, gap: 10, marginBottom: 16 },
  dato: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  datoIcono: { fontSize: 18 },
  datoTexto: { fontSize: 15, color: '#333', fontWeight: '500', textTransform: 'capitalize' },
  separador: { height: 1, backgroundColor: '#eee', marginBottom: 16 },
  descripcion: { fontSize: 16, color: '#333', lineHeight: 26 },
});
