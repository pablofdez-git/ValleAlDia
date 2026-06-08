import { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, TouchableOpacity, Share } from 'react-native';
import { useLocalSearchParams, Stack, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image'; // Librería optimizada que instalamos antes
import * as ExpoLinking from 'expo-linking';
import { supabase } from '../../../lib/supabase';

export default function DetalleNoticia() {
  const { id } = useLocalSearchParams();
  const [noticia, setNoticia] = useState(null);
  const [cargando, setCargando] = useState(true);
  const router = useRouter();

  useEffect(() => {
    async function cargarNoticia() {
      if (!id) return;
      try {
        const { data, error } = await supabase
          .from('noticias')
          .select('*')
          .eq('id', id)
          .single();

        if (error) throw error;
        setNoticia(data);
      } catch (error) {
        console.error("Error cargando noticia:", error.message);
      } finally {
        setCargando(false);
      }
    }
    cargarNoticia();
  }, [id]);

  const compartirNoticia = async () => {
    try {
      const appUrl = ExpoLinking.createURL(`noticias/${id}`);
      await Share.share({
        title: noticia.titulo,
        message: `📢 *${noticia.titulo}*\n\n${noticia.contenido.substring(0, 150)}...\n\n👇 Lee la noticia completa en la App Valle al Día:\n${appUrl}`,
      });
    } catch (error) {
      console.error(error);
    }
  };

  const volverANoticias = () => {
    router.navigate('/noticias');
  };

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
        <Text>Noticia no encontrada.</Text>
        <TouchableOpacity onPress={volverANoticias} style={styles.botonSimple}>
          <Text style={{color: '#1B4D3E', fontWeight: 'bold'}}>Volver al tablón</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <>
      <Stack.Screen
        options={{
          headerTitle: "Noticia",
          headerStyle: { backgroundColor: '#1B4D3E' }, // Color verde de noticias
          headerTintColor: '#fff',
          headerTitleStyle: { fontWeight: 'bold', fontSize: 18 },
          headerTitleAlign: 'center',

          headerLeft: () => (
            <TouchableOpacity
              onPress={volverANoticias}
              style={styles.botonVolverCircular}
            >
              <Ionicons name="chevron-back" size={24} color="white" />
            </TouchableOpacity>
          ),

          headerRight: () => (
            <TouchableOpacity onPress={compartirNoticia} style={styles.botonCompartirHeader}>
              <Ionicons name="share-outline" size={22} color="white" />
            </TouchableOpacity>
          ),
        }}
      />
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        {noticia.imagen_url && (
          <Image
            source={{ uri: noticia.imagen_url }}
            style={styles.imagen}
            contentFit="cover"
            transition={500}
          />
        )}

        <View style={styles.contenido}>
          <Text style={styles.titulo}>{noticia.titulo}</Text>

          <View style={styles.metaData}>
            <Ionicons name="time-outline" size={16} color="#1B4D3E" />
            <Text style={styles.fecha}>
              {new Date(noticia.created_at).toLocaleDateString('es-ES', {
                weekday: 'long', day: 'numeric', month: 'long', year: 'numeric'
              })}
            </Text>
          </View>

          <View style={styles.separador} />

          <Text style={styles.cuerpo}>{noticia.contenido}</Text>

          <View style={{ height: 80 }} />
        </View>
      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  centrado: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  imagen: { width: '100%', height: 280 }, // Imagen sangrada arriba
  contenido: { padding: 24 },

  // Botones de Cabecera (Igual que en eventos)
  botonVolverCircular: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 5,
  },
  botonCompartirHeader: {
    marginRight: 5,
    padding: 8,
  },

  titulo: {
    fontSize: 26,
    fontWeight: '900',
    color: '#1a1a1a',
    marginBottom: 15,
    lineHeight: 34
  },
  metaData: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 5
  },
  fecha: {
    fontSize: 14,
    color: '#1B4D3E',
    fontWeight: '700',
    textTransform: 'capitalize',
    marginLeft: 6
  },
  separador: {
    height: 1,
    backgroundColor: '#eee',
    marginVertical: 20
  },
  cuerpo: {
    fontSize: 19,
    color: '#334155',
    lineHeight: 30,
  },
  botonSimple: { marginTop: 20, padding: 10 }
});
