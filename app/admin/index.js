import { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { supabase } from '../../lib/supabase';

export default function Admin() {
  const [usuario, setUsuario] = useState(null);
  const router = useRouter();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        router.replace('/login');
      } else {
        setUsuario(session.user);
      }
    });
  }, []);

  async function cerrarSesion() {
    await supabase.auth.signOut();
    router.replace('/login');
  }

  if (!usuario) return null;

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contenido}>
      <Text style={styles.bienvenida}>Hola, {usuario.email}</Text>
      <Text style={styles.subtitulo}>¿Qué quieres añadir hoy?</Text>

      <TouchableOpacity style={[styles.boton, { backgroundColor: '#1B4D3E' }]} onPress={() => router.push('/admin/noticia')}>
        <Text style={styles.botonIcono}>📰</Text>
        <View>
          <Text style={styles.botonTitulo}>Nueva noticia</Text>
          <Text style={styles.botonSub}>Publica una noticia del pueblo</Text>
        </View>
      </TouchableOpacity>

      <TouchableOpacity style={[styles.boton, { backgroundColor: '#1A5276' }]} onPress={() => router.push('/admin/evento')}>
        <Text style={styles.botonIcono}>📅</Text>
        <View>
          <Text style={styles.botonTitulo}>Nuevo evento</Text>
          <Text style={styles.botonSub}>Añade un evento del pueblo</Text>
        </View>
      </TouchableOpacity>

      <TouchableOpacity style={[styles.boton, { backgroundColor: '#6C3483' }]} onPress={() => router.push('/admin/evento-comarca')}>
        <Text style={styles.botonIcono}>🗺️</Text>
        <View>
          <Text style={styles.botonTitulo}>Evento comarca</Text>
          <Text style={styles.botonSub}>Añade un evento de la comarca</Text>
        </View>
      </TouchableOpacity>

      <TouchableOpacity style={[styles.boton, { backgroundColor: '#C0392B' }]} onPress={() => router.push('/admin/incidencias')}>
        <Text style={styles.botonIcono}>🚨</Text>
        <View>
          <Text style={styles.botonTitulo}>Ver incidencias</Text>
          <Text style={styles.botonSub}>Revisa las incidencias enviadas</Text>
        </View>
      </TouchableOpacity>

      <TouchableOpacity style={styles.botonCerrar} onPress={cerrarSesion}>
        <Text style={styles.botonCerrarTexto}>Cerrar sesión</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  contenido: { padding: 20, paddingTop: 40 },
  bienvenida: { fontSize: 22, fontWeight: '800', color: '#1a1a1a', marginBottom: 4 },
  subtitulo: { fontSize: 14, color: '#999', marginBottom: 28 },
  boton: {
    borderRadius: 14,
    padding: 18,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    marginBottom: 12,
  },
  botonIcono: { fontSize: 32 },
  botonTitulo: { fontSize: 16, fontWeight: '700', color: '#fff', marginBottom: 2 },
  botonSub: { fontSize: 13, color: 'rgba(255,255,255,0.8)' },
  botonCerrar: {
    marginTop: 20,
    borderWidth: 2,
    borderColor: '#ccc',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
  },
  botonCerrarTexto: { color: '#666', fontWeight: '700', fontSize: 15 },
});
