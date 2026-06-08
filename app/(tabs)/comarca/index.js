import { useEffect, useState, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator, TouchableOpacity, RefreshControl } from 'react-native';
import { useRouter } from 'expo-router';
import { supabase } from '../../../lib/supabase';

export default function Comarca() {
  const [lugares, setLugares] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [refrescando, setRefrescando] = useState(false);
  const router = useRouter();

  const cargarLugares = useCallback(async () => {
    try {
      const hoy = new Date().toISOString().split('T')[0];

      const { data, error } = await supabase
        .from('eventos_comarca')
        .select('*')
        .gte('fecha', hoy)
        .order('fecha', { ascending: true }); // Orden cronológico activo

      if (error) throw error;
      setLugares(data || []);
    } catch (error) {
      console.error("Error cargando comarca:", error);
    } finally {
      setCargando(false);
      setRefrescando(false);
    }
  }, []);

  useEffect(() => {
    cargarLugares();
  }, [cargarLugares]);

  if (cargando && !refrescando) {
    return (
      <View style={styles.centrado}>
        <ActivityIndicator size="large" color="#6C3483" />
      </View>
    );
  }

  return (
    <FlatList
      data={lugares}
      keyExtractor={(item) => item.id.toString()}
      contentContainerStyle={styles.lista}
      refreshControl={
        <RefreshControl refreshing={refrescando} onRefresh={() => {setRefrescando(true); cargarLugares();}} colors={['#6C3483']} />
      }
      ListEmptyComponent={
        <View style={styles.vacioContenedor}>
          <Text style={styles.vacioTexto}>No hay eventos de la comarca próximos</Text>
        </View>
      }
      renderItem={({ item }) => {
        const fecha = new Date(item.fecha);
        const dia = fecha.getDate();
        const mes = fecha.toLocaleDateString('es-ES', { month: 'short' }).replace('.', '').toUpperCase();

        return (
          <TouchableOpacity
            style={styles.tarjeta}
            onPress={() => router.push(`/comarca/${item.id}`)}
            activeOpacity={0.85}
          >
            <View style={styles.fechaBloque}>
              <Text style={styles.dia}>{dia}</Text>
              <Text style={styles.mes}>{mes}</Text>
            </View>

            <View style={styles.info}>
              {/* Mostramos el pueblo en pequeñito arriba */}
              <Text style={styles.puebloBadge}>{item.pueblo?.toUpperCase()}</Text>
              <Text style={styles.titulo} numberOfLines={1}>{item.titulo}</Text>
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
  fechaBloque: { backgroundColor: '#6C3483', width: 75, alignItems: 'center', justifyContent: 'center', padding: 10 },
  dia: { fontSize: 26, fontWeight: '800', color: '#fff' },
  mes: { fontSize: 12, fontWeight: '700', color: '#fff', opacity: 0.9 },
  info: { flex: 1, padding: 12, justifyContent: 'center' },
  puebloBadge: { fontSize: 10, fontWeight: '800', color: '#6C3483', marginBottom: 2, letterSpacing: 1 },
  titulo: { fontSize: 16, fontWeight: '700', color: '#1a1a1a', marginBottom: 2 },
  lugar: { fontSize: 13, color: '#666', fontWeight: '500' },
  hora: { fontSize: 12, color: '#888', marginTop: 2 }
});
