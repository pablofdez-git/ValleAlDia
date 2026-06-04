import { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { Stack } from 'expo-router';
import { supabase } from '../../../lib/supabase';

export default function DetalleEvento() {
  const { id } = useLocalSearchParams();
  const [evento, setEvento] = useState(null);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    async function cargarEvento() {
      const { data, error } = await supabase
        .from('eventos')
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
        <ActivityIndicator size="large" color="#1A5276" />
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
          title: 'Evento',
          headerStyle: { backgroundColor: '#1A5276' },
          headerTintColor: '#fff',
          headerTitleStyle: { fontWeight: 'bold' },
        }}
      />
      <ScrollView style={styles.container} contentContainerStyle={styles.contenido}>
        <View style={styles.cabecera}>
          <Text style={styles.titulo}>{evento.titulo}</Text>
        </View>
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
  cabecera: { marginBottom: 20 },
  titulo: { fontSize: 24, fontWeight: '800', color: '#1a1a1a', lineHeight: 32 },
  datosBloque: { backgroundColor: '#f0f4f8', borderRadius: 12, padding: 16, gap: 10, marginBottom: 16 },
  dato: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  datoIcono: { fontSize: 18 },
  datoTexto: { fontSize: 15, color: '#333', fontWeight: '500', textTransform: 'capitalize' },
  separador: { height: 1, backgroundColor: '#eee', marginBottom: 16 },
  descripcion: { fontSize: 16, color: '#333', lineHeight: 26 },
});
