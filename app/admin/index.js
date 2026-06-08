import { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { supabase } from '../../lib/supabase';

export default function AdminDashboard() {
  const [usuario, setUsuario] = useState(null);
  const router = useRouter();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) router.replace('/login');
      else setUsuario(session.user);
    });
  }, []);

  async function cerrarSesion() {
    await supabase.auth.signOut();
    router.replace('/login');
  }

  if (!usuario) return <View style={styles.centrado}><ActivityIndicator size="large" color="#333" /></View>;

  const MenuBoton = ({ titulo, sub, color, icono, ruta }) => (
    <TouchableOpacity
      style={[styles.boton, { borderLeftColor: color }]}
      onPress={() => router.push(ruta)}
    >
      <View style={[styles.iconoContenedor, { backgroundColor: color }]}>
        <Ionicons name={icono} size={24} color="#fff" />
      </View>
      <View style={styles.textoContenedor}>
        <Text style={styles.botonTitulo}>{titulo}</Text>
        <Text style={styles.botonSub}>{sub}</Text>
      </View>
      <Ionicons name="chevron-forward" size={20} color="#ccc" />
    </TouchableOpacity>
  );

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contenido}>
      <View style={styles.header}>
        <Text style={styles.bienvenida}>Panel de Gestión</Text>
        <Text style={styles.subtitulo}>Conectado como: {usuario.email}</Text>
      </View>

      <Text style={styles.seccionTitulo}>NOTICIAS</Text>
      <MenuBoton titulo="Nueva Noticia" sub="Publicar aviso o novedad" color="#1B4D3E" icono="newspaper" ruta="/admin/noticia" />
      <MenuBoton titulo="Gestionar Noticias" sub="Editar o borrar noticias" color="#2E86AB" icono="list" ruta="/admin/gestionar-noticias" />

      <Text style={styles.seccionTitulo}>EVENTOS DEL PUEBLO</Text>
      <MenuBoton titulo="Nuevo Evento" sub="Añadir a la agenda local" color="#1A5276" icono="calendar" ruta="/admin/evento" />
      <MenuBoton titulo="Gestionar Agenda" sub="Modificar eventos locales" color="#2E86AB" icono="list" ruta="/admin/gestionar-eventos" />

      <Text style={styles.seccionTitulo}>COMARCA</Text>
      <MenuBoton titulo="Evento Comarca" sub="Añadir evento de otro pueblo" color="#6C3483" icono="map" ruta="/admin/evento-comarca" />
      <MenuBoton titulo="Gestionar Comarca" sub="Editar eventos de la zona" color="#2E86AB" icono="list" ruta="/admin/gestionar-comarca" />

      <Text style={styles.seccionTitulo}>SISTEMA</Text>
      <MenuBoton titulo="Incidencias" sub="Ver reportes de vecinos" color="#C0392B" icono="warning" ruta="/admin/incidencias" />

      <TouchableOpacity style={styles.botonCerrar} onPress={cerrarSesion}>
        <Ionicons name="log-out-outline" size={20} color="#666" />
        <Text style={styles.botonCerrarTexto}>Cerrar Sesión Segura</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F2F4F7' },
  contenido: { padding: 20, paddingTop: 60, paddingBottom: 40 },
  header: { marginBottom: 30 },
  bienvenida: { fontSize: 28, fontWeight: '900', color: '#1a1a1a' },
  subtitulo: { fontSize: 14, color: '#666', marginTop: 4 },
  seccionTitulo: { fontSize: 12, fontWeight: '800', color: '#999', marginTop: 25, marginBottom: 10, letterSpacing: 1 },
  boton: {
    backgroundColor: '#fff', borderRadius: 16, padding: 16, flexDirection: 'row',
    alignItems: 'center', marginBottom: 12, borderLeftWidth: 6,
    elevation: 2, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 5
  },
  iconoContenedor: { width: 44, height: 44, borderRadius: 12, alignItems: 'center', justifyContent: 'center', marginRight: 15 },
  textoContenedor: { flex: 1 },
  botonTitulo: { fontSize: 16, fontWeight: '700', color: '#1a1a1a' },
  botonSub: { fontSize: 13, color: '#888', marginTop: 2 },
  botonCerrar: { marginTop: 30, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', padding: 15 },
  botonCerrarTexto: { color: '#666', fontWeight: '700', marginLeft: 10 },
  centrado: { flex: 1, justifyContent: 'center', alignItems: 'center' }
});
