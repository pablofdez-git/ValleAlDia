import { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, TouchableOpacity, Share } from 'react-native';
import { useLocalSearchParams, Stack, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import * as ExpoLinking from 'expo-linking';
import { supabase } from '../../../lib/supabase';

export default function DetalleComarca() {
  const { id } = useLocalSearchParams();
  const [lugar, setLugar] = useState(null);
  const [cargando, setCargando] = useState(true);
  const router = useRouter();

  useEffect(() => {
    async function cargarLugar() {
      if (!id) return;
      try {
        const { data, error } = await supabase
          .from('eventos_comarca')
          .select('*')
          .eq('id', id)
          .single();

        if (error) throw error;
        setLugar(data);
      } catch (error) {
        console.error("Error:", error.message);
      } finally {
        setCargando(false);
      }
    }
    cargarLugar();
  }, [id]);

  const compartirLugar = async () => {
    try {
      const appUrl = ExpoLinking.createURL(`comarca/${id}`);
      await Share.share({
        message: `💜 *${lugar.pueblo.toUpperCase()}* - ${lugar.titulo}\n📅 ${new Date(lugar.fecha).toLocaleDateString('es-ES')}\n📍 ${lugar.lugar}\n\nConsulta los detalles en la App Valle al Día:\n${appUrl}`,
      });
    } catch (error) {
      console.error(error);
    }
  };

  if (cargando) return <View style={styles.centrado}><ActivityIndicator size="large" color="#6C3483" /></View>;
  if (!lugar) return <View style={styles.centrado}><Text>No se encontró la información.</Text></View>;

  return (
    <>
      <Stack.Screen
        options={{
          headerTitle: "Detalle Comarca",
          headerStyle: { backgroundColor: '#6C3483' },
          headerTintColor: '#fff',
          headerTitleAlign: 'center',
          headerLeft: () => (
            <TouchableOpacity onPress={() => router.navigate('/comarca')} style={styles.botonVolverCircular}>
              <Ionicons name="chevron-back" size={24} color="white" />
            </TouchableOpacity>
          ),
          headerRight: () => (
            <TouchableOpacity onPress={compartirLugar} style={{padding: 8}}>
              <Ionicons name="share-outline" size={22} color="white" />
            </TouchableOpacity>
          ),
        }}
      />
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        {lugar.imagen_url && (
          <Image source={{ uri: lugar.imagen_url }} style={styles.imagenCabecera} contentFit="cover" />
        )}

        <View style={styles.contenido}>
          {/* PUEBLO ARRIBA DEL TODO */}
          <Text style={styles.puebloCabecera}>{lugar.pueblo?.toUpperCase()}</Text>
          <Text style={styles.titulo}>{lugar.titulo}</Text>

          <View style={styles.tarjetaInfo}>
            <View style={styles.filaInfo}>
              <View style={styles.circuloIcono}>
                <Ionicons name="calendar" size={20} color="#6C3483" />
              </View>
              <View>
                <Text style={styles.label}>CUÁNDO</Text>
                <Text style={styles.valor}>
                  {new Date(lugar.fecha).toLocaleDateString('es-ES', {
                    weekday: 'long', day: 'numeric', month: 'long'
                  })}
                  {lugar.hora ? ` - ${lugar.hora}` : ''}
                </Text>
              </View>
            </View>

            <View style={[styles.filaInfo, { marginTop: 20 }]}>
              <View style={styles.circuloIcono}>
                <Ionicons name="location" size={20} color="#6C3483" />
              </View>
              <View>
                <Text style={styles.label}>LUGAR EXACTO</Text>
                <Text style={styles.valor}>{lugar.lugar || lugar.pueblo}</Text>
              </View>
            </View>
          </View>

          <View style={styles.seccionTexto}>
            <Text style={styles.subtitulo}>Descripción</Text>
            <Text style={styles.descripcion}>{lugar.descripcion}</Text>
          </View>

          <View style={{ height: 80 }} />
        </View>
      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  centrado: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  imagenCabecera: { width: '100%', height: 250 },
  contenido: { padding: 24 },
  botonVolverCircular: { width: 38, height: 38, borderRadius: 19, backgroundColor: 'rgba(255, 255, 255, 0.15)', alignItems: 'center', justifyContent: 'center', marginLeft: 5 },

  // ESTILO PARA EL PUEBLO EN EL DETALLE
  puebloCabecera: { fontSize: 13, fontWeight: '900', color: '#6C3483', letterSpacing: 2, marginBottom: 8 },
  titulo: { fontSize: 26, fontWeight: '900', color: '#1a1a1a', marginBottom: 20 },

  tarjetaInfo: { backgroundColor: '#F8FAFC', borderRadius: 16, padding: 16, marginBottom: 30, borderWidth: 1, borderColor: '#E2E8F0' },
  filaInfo: { flexDirection: 'row', alignItems: 'center' },
  circuloIcono: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center', marginRight: 12, borderWidth: 1, borderColor: '#E2E8F0' },
  label: { fontSize: 11, color: '#64748B', fontWeight: '800', letterSpacing: 1 },
  valor: { fontSize: 15, color: '#333', fontWeight: '600', marginTop: 2, textTransform: 'capitalize' },
  subtitulo: { fontSize: 19, fontWeight: '800', color: '#1a1a1a', marginBottom: 12, borderLeftWidth: 4, borderLeftColor: '#6C3483', paddingLeft: 12 },
  descripcion: { fontSize: 18, color: '#334155', lineHeight: 28 },
});
