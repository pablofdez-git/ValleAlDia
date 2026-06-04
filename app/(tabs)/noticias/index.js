import { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator, TouchableOpacity, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { supabase } from '../../../lib/supabase';

export default function Noticias() {
  const [noticias, setNoticias] = useState([]);
  const [cargando, setCargando] = useState(true);
  const router = useRouter();

  useEffect(() => {
    async function cargarNoticias() {
      const { data, error } = await supabase
        .from('noticias')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) console.error(error);
      else setNoticias(data);
      setCargando(false);
    }
    cargarNoticias();
  }, []);

  if (cargando) {
    return (
      <View style={styles.centrado}>
        <ActivityIndicator size="large" color="#1B4D3E" />
      </View>
    );
  }

  if (noticias.length === 0) {
    return (
      <View style={styles.centrado}>
        <Text style={styles.vacio}>No hay noticias todavía</Text>
      </View>
    );
  }

  return (
    <FlatList
      data={noticias}
      keyExtractor={(item) => item.id.toString()}
      contentContainerStyle={styles.lista}
      renderItem={({ item }) => (
        <TouchableOpacity
          style={styles.tarjeta}
          onPress={() => router.push(`/noticias/${item.id}`)}
          activeOpacity={0.85}
        >
          {item.imagen_url ? (
            <Image source={{ uri: item.imagen_url }} style={styles.imagen} />
          ) : (
            <Image
            source={require('../../../assets/fondoPredetNoticias.jpg')}
            style={styles.imagen}
            />
          )}
          <View style={styles.contenido}>
            <Text style={styles.titulo} numberOfLines={2}>{item.titulo}</Text>
            <Text style={styles.preview} numberOfLines={3}>{item.contenido}</Text>
            <Text style={styles.fecha}>
              {new Date(item.created_at).toLocaleDateString('es-ES', {
                day: 'numeric', month: 'long', year: 'numeric'
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
