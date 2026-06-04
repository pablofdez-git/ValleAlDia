import { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { supabase } from '../../../lib/supabase';

export default function Eventos() {
  const [eventos, setEventos] = useState([]);
  const [cargando, setCargando] = useState(true);
  const router = useRouter();

  useEffect(() => {
    async function cargarEventos() {
      const { data, error } = await supabase
        .from('eventos')
        .select('*')
        .order('fecha', { ascending: true });
      if (error) console.error(error);
      else setEventos(data);
      setCargando(false);
    }
    cargarEventos();
  }, []);

  if (cargando) {
    return (
      <View style={styles.centrado}>
        <ActivityIndicator size="large" color="#1A5276" />
      </View>
    );
  }

  if (eventos.length === 0) {
    return (
      <View style={styles.centrado}>
        <Text style={styles.vacio}>No hay eventos próximos</Text>
      </View>
    );
  }

  return (
    <FlatList
      data={eventos}
      keyExtractor={(item) => item.id.toString()}
      contentContainerStyle={styles.lista}
      renderItem={({ item }) => {
        const fecha = new Date(item.fecha);
        const dia = fecha.getDate();
        const mes = fecha.toLocaleDateString('es-ES', { month: 'short' }).toUpperCase();
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
              <Text style={styles.descripcion} numberOfLines={2}>{item.descripcion}</Text>
            </View>
          </TouchableOpacity>
        );
      }}
    />
  );
}

const styles = StyleSheet.create({
  lista: { padding: 16, gap: 12 },
  centrado: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  vacio: { fontSize: 16, color: '#999' },
  tarjeta: {
    backgroundColor: '#fff',
    borderRadius: 12,
    flexDirection: 'row',
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  fechaBloque: {
    backgroundColor: '#1A5276',
    width: 70,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
  },
  dia: { fontSize: 28, fontWeight: '800', color: '#fff' },
  mes: { fontSize: 13, fontWeight: '600', color: '#fff', opacity: 0.85 },
  info: { flex: 1, padding: 14 },
  titulo: { fontSize: 16, fontWeight: '700', color: '#1a1a1a', marginBottom: 4 },
  lugar: { fontSize: 13, color: '#1A5276', fontWeight: '600', marginBottom: 6 },
  descripcion: { fontSize: 13, color: '#666', lineHeight: 18 },
});
