import { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Image, ActivityIndicator } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { supabase } from '../../../lib/supabase';
import { Stack } from 'expo-router';

export default function DetalleNoticia() {
  const { id } = useLocalSearchParams();
  const [noticia, setNoticia] = useState(null);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    async function cargarNoticia() {
      const { data, error } = await supabase
        .from('noticias')
        .select('*')
        .eq('id', id)
        .single();
      if (error) console.error(error);
      else setNoticia(data);
      setCargando(false);
    }
    cargarNoticia();
  }, [id]);

  if (cargando) {
    return (
      <View style={styles.centrado}>
        <ActivityIndicator size="large" color="#1B4D3E" />
      </View>
    );
  }

  if (!noticia) {
    return (
      <View style={styles.centrado}>
        <Text>Noticia no encontrada</Text>
      </View>
    );
  }

return (
  <>
    <Stack.Screen
      options={{
        title: 'Noticia',
        headerStyle: { backgroundColor: '#1B4D3E' },
        headerTintColor: '#fff',
        headerTitleStyle: { fontWeight: 'bold' },
      }}
    />
    <ScrollView style={styles.container} contentContainerStyle={styles.contenido}>
      {noticia.imagen_url && (
        <Image source={{ uri: noticia.imagen_url }} style={styles.imagen} />
      )}
      <Text style={styles.titulo}>{noticia.titulo}</Text>
      <Text style={styles.fecha}>
        {new Date(noticia.created_at).toLocaleDateString('es-ES', {
          weekday: 'long', day: 'numeric', month: 'long', year: 'numeric'
        })}
      </Text>
      <View style={styles.separador} />
      <Text style={styles.cuerpo}>{noticia.contenido}</Text>
    </ScrollView>
  </>
);
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  centrado: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  contenido: { padding: 20 },
  imagen: { width: '100%', height: 220, borderRadius: 12, marginBottom: 16 },
  titulo: { fontSize: 24, fontWeight: '800', color: '#1a1a1a', lineHeight: 32, marginBottom: 8 },
  fecha: { fontSize: 13, color: '#1B4D3E', fontWeight: '600', textTransform: 'capitalize' },
  separador: { height: 1, backgroundColor: '#eee', marginVertical: 16 },
  cuerpo: { fontSize: 16, color: '#333', lineHeight: 26 },
});
