import { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator, TouchableOpacity, Alert } from 'react-native';
import { supabase } from '../../lib/supabase';

const COLORES_ESTADO = {
  pendiente: { bg: '#FEF3C7', text: '#92400E' },
  revisada: { bg: '#DBEAFE', text: '#1E40AF' },
  resuelta: { bg: '#D1FAE5', text: '#065F46' },
};

export default function VerIncidencias() {
  const [incidencias, setIncidencias] = useState([]);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    cargar();
  }, []);

  async function cargar() {
    const { data, error } = await supabase
      .from('incidencias')
      .select('*')
      .order('created_at', { ascending: false });
    if (error) console.error(error);
    else setIncidencias(data);
    setCargando(false);
  }

  async function cambiarEstado(id, estadoActual) {
    const estados = ['pendiente', 'revisada', 'resuelta'];
    const opciones = estados.filter(e => e !== estadoActual);
    Alert.alert('Cambiar estado', 'Selecciona el nuevo estado:', [
      ...opciones.map(estado => ({
        text: estado.charAt(0).toUpperCase() + estado.slice(1),
        onPress: async () => {
          await supabase.from('incidencias').update({ estado }).eq('id', id);
          cargar();
        }
      })),
      { text: 'Cancelar', style: 'cancel' }
    ]);
  }

  async function eliminar(id) {
    Alert.alert('Eliminar', '¿Seguro que quieres eliminar esta incidencia?', [
      {
        text: 'Eliminar', style: 'destructive', onPress: async () => {
          await supabase.from('incidencias').delete().eq('id', id);
          cargar();
        }
      },
      { text: 'Cancelar', style: 'cancel' }
    ]);
  }

  if (cargando) {
    return <View style={styles.centrado}><ActivityIndicator size="large" color="#C0392B" /></View>;
  }

  if (incidencias.length === 0) {
    return <View style={styles.centrado}><Text style={styles.vacio}>No hay incidencias</Text></View>;
  }

  return (
    <FlatList
      data={incidencias}
      keyExtractor={(item) => item.id.toString()}
      contentContainerStyle={styles.lista}
      renderItem={({ item }) => {
        const colores = COLORES_ESTADO[item.estado] || COLORES_ESTADO.pendiente;
        return (
          <View style={styles.tarjeta}>
            <View style={styles.cabecera}>
              <Text style={styles.titulo} numberOfLines={2}>{item.titulo}</Text>
              <TouchableOpacity
                style={[styles.estadoBadge, { backgroundColor: colores.bg }]}
                onPress={() => cambiarEstado(item.id, item.estado)}
              >
                <Text style={[styles.estadoTexto, { color: colores.text }]}>{item.estado}</Text>
              </TouchableOpacity>
            </View>
            <Text style={styles.descripcion}>{item.descripcion}</Text>
            <View style={styles.pie}>
              <Text style={styles.fecha}>
                {new Date(item.created_at).toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric' })}
              </Text>
              <TouchableOpacity onPress={() => eliminar(item.id)}>
                <Text style={styles.eliminar}>Eliminar</Text>
              </TouchableOpacity>
            </View>
          </View>
        );
      }}
    />
  );
}

const styles = StyleSheet.create({
  lista: { padding: 16, paddingTop: 50, gap: 12 },
  centrado: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  vacio: { fontSize: 16, color: '#999' },
  tarjeta: { backgroundColor: '#fff', borderRadius: 12, padding: 16, elevation: 3, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.08, shadowRadius: 8 },
  cabecera: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 },
  titulo: { fontSize: 15, fontWeight: '700', color: '#1a1a1a', flex: 1, marginRight: 8 },
  estadoBadge: { borderRadius: 6, paddingHorizontal: 10, paddingVertical: 4 },
  estadoTexto: { fontSize: 12, fontWeight: '700' },
  descripcion: { fontSize: 14, color: '#555', lineHeight: 20, marginBottom: 12 },
  pie: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  fecha: { fontSize: 12, color: '#999' },
  eliminar: { fontSize: 13, color: '#C0392B', fontWeight: '700' },
});
