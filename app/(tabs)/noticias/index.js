import { useEffect, useState, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator, TouchableOpacity, RefreshControl } from 'react-native';
import { Image } from 'expo-image'; // Mejor que Image de RN
import { useRouter } from 'expo-router';
import { supabase } from '../../../lib/supabase';

export default function Noticias() {
  const [noticias, setNoticias] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [refrescando, setRefrescando] = useState(false);
  const router = useRouter();

  const cargarNoticias = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('noticias')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setNoticias(data);
    } catch (error) {
      console.error("Error cargando noticias:", error.message);
      // Aquí podrías usar un Alert o un Toast
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
        <ActivityIndicator size="large" color="#1B4D3E" />
        <Text style={{marginTop: 10, color: '#666'}}>Cargando últimas noticias...</Text>
      </View>
    );
  }

  return (
    <FlatList
      data={noticias}
      keyExtractor={(item) => item.id.toString()}
      contentContainerStyle={styles.lista}
      refreshControl={
        <RefreshControl refreshing={refrescando} onRefresh={() => {
          setRefrescando(true);
          cargarNoticias();
        }} colors={['#1B4D3E']} />
      }
      renderItem={({ item }) => (
        <TouchableOpacity
          style={styles.tarjeta}
          onPress={() => router.push(`/noticias/${item.id}`)}
          activeOpacity={0.9}
        >
          <Image
            source={item.imagen_url || require('../../../assets/fondoPredetNoticias.jpg')}
            style={styles.imagen}
            contentFit="cover"
            transition={500} // Efecto de fundido al cargar
          />
          <View style={styles.contenido}>
            <Text style={styles.titulo}>{item.titulo}</Text>
            <Text style={styles.fecha}>
              {new Date(item.created_at).toLocaleDateString('es-ES', {
                day: 'numeric', month: 'short', year: 'numeric'
              })}
            </Text>
          </View>
        </TouchableOpacity>
      )}
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
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  imagen: { width: '100%', height: 180 },
  contenido: { padding: 14 },
  titulo: { fontSize: 17, fontWeight: '700', color: '#1a1a1a', marginBottom: 6 },
  preview: { fontSize: 14, color: '#555', lineHeight: 20, marginBottom: 10 },
  fecha: { fontSize: 12, color: '#1B4D3E', fontWeight: '600' },
});
