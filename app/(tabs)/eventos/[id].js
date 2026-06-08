import { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, TouchableOpacity, Share } from 'react-native';
import { useLocalSearchParams, Stack, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as ExpoLinking from 'expo-linking';
import { supabase } from '../../../lib/supabase';

export default function DetalleEvento() {
  const { id } = useLocalSearchParams();
  const [evento, setEvento] = useState(null);
  const [cargando, setCargando] = useState(true);
  const router = useRouter();

  useEffect(() => {
    async function cargar() {
      if (!id) return;
      const { data } = await supabase.from('eventos').select('*').eq('id', id).single();
      if (data) setEvento(data);
      setCargando(false);
    }
    cargar();
  }, [id]);

  const compartir = async () => {
    const url = ExpoLinking.createURL(`eventos/${id}`);
    await Share.share({
      message: `📅 *${evento.titulo}*\n⏰ ${evento.hora}\n📍 ${evento.lugar}\n\nVer en la App:\n${url}`,
    });
  };

  if (cargando) return <View style={styles.centrado}><ActivityIndicator size="large" color="#1A5276" /></View>;
  if (!evento) return <View style={styles.centrado}><Text>No encontrado</Text></View>;

  return (
    <>
      <Stack.Screen options={{
        headerTitle: "Detalle del Evento",
        headerStyle: { backgroundColor: '#1A5276' },
        headerTintColor: '#fff',
        headerTitleAlign: 'center',
        headerLeft: () => (
          <TouchableOpacity onPress={() => router.navigate('/eventos')} style={styles.btnVolver}>
            <Ionicons name="chevron-back" size={24} color="white" />
          </TouchableOpacity>
        ),
        headerRight: () => (
          <TouchableOpacity onPress={compartir} style={{padding: 8}}>
            <Ionicons name="share-outline" size={22} color="white" />
          </TouchableOpacity>
        ),
      }} />
      <ScrollView style={styles.container}>
        <View style={styles.contenido}>
          <Text style={styles.titulo}>{evento.titulo}</Text>
          <View style={styles.tarjeta}>
            <View style={styles.fila}>
              <View style={styles.circulo}><Ionicons name="calendar" size={20} color="#1A5276" /></View>
              <View>
                <Text style={styles.label}>FECHA Y HORA</Text>
                <Text style={styles.valor}>
                  {new Date(evento.fecha).toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' })}
                  {"\n"}<Text style={{color: '#1A5276'}}>A las {evento.hora}</Text>
                </Text>
              </View>
            </View>
            <View style={[styles.fila, { marginTop: 20 }]}>
              <View style={styles.circulo}><Ionicons name="location" size={20} color="#1A5276" /></View>
              <View>
                <Text style={styles.label}>LUGAR</Text>
                <Text style={styles.valor}>{evento.lugar}</Text>
              </View>
            </View>
          </View>
          <Text style={styles.subtitulo}>Información</Text>
          <Text style={styles.descripcion}>{evento.descripcion}</Text>
        </View>
      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  centrado: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  contenido: { padding: 24 },
  btnVolver: { width: 38, height: 38, borderRadius: 19, backgroundColor: 'rgba(255,255,255,0.2)', alignItems: 'center', justifyContent: 'center' },
  titulo: { fontSize: 26, fontWeight: '900', color: '#1a1a1a', marginBottom: 20 },
  tarjeta: { backgroundColor: '#F8FAFC', borderRadius: 20, padding: 20, marginBottom: 30, borderWidth: 1, borderColor: '#E2E8F0' },
  fila: { flexDirection: 'row', alignItems: 'center' },
  circulo: { width: 42, height: 42, borderRadius: 21, backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center', marginRight: 15, borderWidth: 1, borderColor: '#e2e8f0' },
  label: { fontSize: 11, color: '#64748b', fontWeight: '800', letterSpacing: 1 },
  valor: { fontSize: 17, color: '#333', fontWeight: '700', textTransform: 'capitalize' },
  subtitulo: { fontSize: 19, fontWeight: '800', borderLeftWidth: 4, borderLeftColor: '#1A5276', paddingLeft: 12, marginBottom: 15 },
  descripcion: { fontSize: 18, color: '#334155', lineHeight: 28 },
});
