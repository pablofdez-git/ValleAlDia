import { useEffect, useState, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator, TouchableOpacity, RefreshControl } from 'react-native';
import { useRouter } from 'expo-router';
import { supabase } from '../../../lib/supabase';

export default function Eventos() {
  const [eventos, setEventos] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [refrescando, setRefrescando] = useState(false);
  const router = useRouter();

  const cargarEventos = useCallback(async () => {
    try {
      // Calculamos HOY en formato YYYY-MM-DD para filtrar
      const hoy = new Date().toISOString().split('T')[0];

      const { data, error } = await supabase
        .from('eventos')
        .select('*')
        .gte('fecha', hoy) // Solo de hoy en adelante
        .order('fecha', { ascending: true }); // Orden cronológico (1º el más cercano)

      if (error) throw error;
      setEventos(data || []);
    } catch (err) {
      console.error("Error cargando eventos:", err);
    } finally {
      setCargando(false);
      setRefrescando(false);
    }
  }, []);

  useEffect(() => {
    cargarEventos();
  }, [cargarEventos]);

  if (cargando && !refrescando) {
    return (
      <View style={styles.centrado}>
        <ActivityIndicator size="large" color="#1A5276" />
      </View>
    );
  }

  return (
    <FlatList
      data={eventos}
      keyExtractor={(item) => item.id.toString()}
      contentContainerStyle={styles.lista}
      refreshControl={
        <RefreshControl refreshing={refrescando} onRefresh={() => {setRefrescando(true); cargarEventos();}} colors={['#1A5276']} />
      }
      ListEmptyComponent={
        <View style={styles.vacioContenedor}>
          <Text style={styles.vacioTexto}>No hay eventos próximos en la agenda</Text>
        </View>
      }
      renderItem={({ item }) => {
        // Parseamos la fecha YYYY-MM-DD
        const fecha = new Date(item.fecha);
        const dia = fecha.getDate();
        const mes = fecha.toLocaleDateString('es-ES', { month: 'short' }).replace('.', '').toUpperCase();

        return (
          <TouchableOpacity
            style={styles.tarjeta}
            onPress={() => router.push(`/eventos/${item.id}`)}
            activeOpacity={0.85}
          >
            <View style={styles.fechaBloque}>
              <Text style={styles.dia}>{dia}</Text>
              <Text style={styles.mes}>{mes}</Text>
            </View>
            <View style={styles.info}>
              <Text style={styles.titulo} numberOfLines={2}>{item.titulo}</Text>
              <Text style={styles.lugar}>📍 {item.lugar}</Text>
              {item.hora && <Text style={styles.hora}>🕒 {item.hora}</Text>}
            </View>
          </TouchableOpacity>
        );
      }}
    />
  );
}

const styles = StyleSheet.create({
  lista: { padding: 16, flexGrow: 1 },
  centrado: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  vacioContenedor: { marginTop: 100, alignItems: 'center' },
  vacioTexto: { color: '#999', fontSize: 16 },
  tarjeta: {
    backgroundColor: '#fff',
    borderRadius: 14,
    flexDirection: 'row',
    marginBottom: 12,
    overflow: 'hidden',
    elevation: 3,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  fechaBloque: { backgroundColor: '#1A5276', width: 75, alignItems: 'center', justifyContent: 'center', padding: 10 },
  dia: { fontSize: 26, fontWeight: '800', color: '#fff' },
  mes: { fontSize: 12, fontWeight: '700', color: '#fff', opacity: 0.9 },
  info: { flex: 1, padding: 15, justifyContent: 'center' },
  titulo: { fontSize: 17, fontWeight: '700', color: '#1a1a1a', marginBottom: 4 },
  lugar: { fontSize: 13, color: '#1A5276', fontWeight: '600' },
  hora: { fontSize: 12, color: '#666', marginTop: 2 }
});
