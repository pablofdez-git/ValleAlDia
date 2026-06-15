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

  if (!usuario) {
    return (
      <View style={styles.centrado}>
        <ActivityIndicator size="large" color="#333" />
      </View>
    );
  }

  // Componente reutilizable para los botones del menú
  const MenuBoton = ({ titulo, sub, color, icono, ruta }) => (
    <TouchableOpacity
      style={[styles.boton, { borderLeftColor: color }]}
      onPress={() => router.push(ruta)}
    >
      <View style={[styles.iconoContenedor, { backgroundColor: color }]}>
        <Ionicons name={icono} size={22} color="#fff" />
      </View>
      <View style={styles.textoContenedor}>
        <Text style={styles.botonTitulo}>{titulo}</Text>
        <Text style={styles.botonSub}>{sub}</Text>
      </View>
      <Ionicons name="chevron-forward" size={18} color="#ccc" />
    </TouchableOpacity>
  );

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contenido}>
      <View style={styles.header}>
        <Text style={styles.bienvenida}>Panel de Gestión</Text>
        <Text style={styles.subtitulo}>Administrador: {usuario.email}</Text>
      </View>

      {/* SECCIÓN URGENTE */}
      <Text style={styles.seccionTitulo}>COMUNICACIÓN DIRECTA</Text>
      <MenuBoton
        titulo="Bando Urgente"
        sub="Enviar notificación push a todos"
        color="#C0392B"
        icono="megaphone"
        ruta="/admin/aviso-urgente"
      />

      {/* SECCIÓN NOTICIAS */}
      <Text style={styles.seccionTitulo}>NOTICIAS (VERDE)</Text>
      <MenuBoton titulo="Nueva Noticia" sub="Publicar en el tablón" color="#1B4D3E" icono="newspaper" ruta="/admin/noticia" />
      <MenuBoton titulo="Gestionar Noticias" sub="Editar o eliminar" color="#2E86AB" icono="list" ruta="/admin/gestionar-noticias" />

      {/* SECCIÓN EVENTOS */}
      <Text style={styles.seccionTitulo}>AGENDA LOCAL (AZUL)</Text>
      <MenuBoton titulo="Nuevo Evento" sub="Añadir evento del pueblo" color="#1A5276" icono="calendar" ruta="/admin/evento" />
      <MenuBoton titulo="Gestionar Agenda" sub="Modificar calendario local" color="#2E86AB" icono="list" ruta="/admin/gestionar-eventos" />

      {/* SECCIÓN COMARCA */}
      <Text style={styles.seccionTitulo}>COMARCA (MORADO)</Text>
      <MenuBoton titulo="Evento Comarca" sub="Añadir evento de la zona" color="#6C3483" icono="map" ruta="/admin/evento-comarca" />
      <MenuBoton titulo="Gestionar Comarca" sub="Modificar eventos externos" color="#2E86AB" icono="list" ruta="/admin/gestionar-comarca" />

      {/* SECCIÓN INCIDENCIAS */}
      <Text style={styles.seccionTitulo}>SISTEMA</Text>
      <MenuBoton titulo="Ver Incidencias" sub="Reportes de los vecinos" color="#C0392B" icono="warning" ruta="/admin/incidencias" />

      <TouchableOpacity style={styles.botonCerrar} onPress={cerrarSesion}>
        <Ionicons name="log-out-outline" size={20} color="#666" />
        <Text style={styles.botonCerrarTexto}>Cerrar Sesión</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8F9FA' },
  contenido: { padding: 20, paddingTop: 60, paddingBottom: 40 },
  header: { marginBottom: 25 },
  bienvenida: { fontSize: 26, fontWeight: '900', color: '#1a1a1a' },
  subtitulo: { fontSize: 13, color: '#666', marginTop: 4 },
  seccionTitulo: { fontSize: 11, fontWeight: '800', color: '#999', marginTop: 25, marginBottom: 10, letterSpacing: 1 },
  boton: {
    backgroundColor: '#fff', borderRadius: 16, padding: 15, flexDirection: 'row',
    alignItems: 'center', marginBottom: 10, borderLeftWidth: 5,
    elevation: 3, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 5
  },
  iconoContenedor: { width: 40, height: 40, borderRadius: 10, alignItems: 'center', justifyContent: 'center', marginRight: 15 },
  textoContenedor: { flex: 1 },
  botonTitulo: { fontSize: 15, fontWeight: '700', color: '#1a1a1a' },
  botonSub: { fontSize: 12, color: '#888', marginTop: 1 },
  botonCerrar: { marginTop: 40, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', padding: 15 },
  botonCerrarTexto: { color: '#666', fontWeight: '700', marginLeft: 8 },
  centrado: { flex: 1, justifyContent: 'center', alignItems: 'center' }
});
