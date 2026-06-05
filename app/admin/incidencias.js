import { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator, TouchableOpacity, Alert } from 'react-native';
import { supabase } from '../../lib/supabase';

const ESTADOS = {
  pendiente: { bg: '#FEF3C7', text: '#92400E', icono: '🕐' },
  revisada: { bg: '#DBEAFE', text: '#1E40AF', icono: '👁️' },
  resuelta: { bg: '#D1FAE5', text: '#065F46', icono: '✅' },
};

export default function VerIncidencias() {
  const [incidencias, setIncidencias] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [filtro, setFiltro] = useState('todas');

  useEffect(() => { cargar(); }, []);

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

  const incidenciasFiltradas = filtro === 'todas' ? incidencias : incidencias.filter(i => i.estado === filtro);

  if (cargando) return <View style={styles.centrado}><ActivityIndicator size="large" color="#C0392B" /></View>;

  return (
    <View style={{ flex: 1, backgroundColor: '#f5f5f5' }}>
      <View style={styles.filtros}>
        {['todas', 'pendiente', 'revisada', 'resuelta'].map(f => (
          <TouchableOpacity
            key={f}
            style={[styles.filtroPill, filtro === f && styles.filtroPillActivo]}
            onPress={() => setFiltro(f)}
          >
            <Text style={[styles.filtroTexto, filtro === f && styles.filtroTextoActivo]}>
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {incidenciasFiltradas.length === 0 ? (
        <View style={styles.centrado}>
          <Text style={styles.vacio}>No hay incidencias {filtro !== 'todas' ? filtro + 's' : ''}</Text>
        </View>
      ) : (
        <FlatList
          data={incidenciasFiltradas}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={styles.lista}
          renderItem={({ item }) => {
            const estado = ESTADOS[item.estado] || ESTADOS.pendiente;
            return (
              <View style={styles.tarjeta}>
                <View style={styles.cabecera}>
                  <Text style={styles.titulo} numberOfLines={2}>{item.titulo}</Text>
                  <TouchableOpacity
                    style={[styles.estadoBadge, { backgroundColor: estado.bg }]}
                    onPress={() => cambiarEstado(item.id, item.estado)}
                  >
                    <Text style={{ fontSize: 12 }}>{estado.icono}</Text>
                    <Text style={[styles.estadoTexto, { color: estado.text }]}>{item.estado}</Text>
                  </TouchableOpacity>
                </View>
                <Text style={styles.descripcion}>{item.descripcion}</Text>
                <View style={styles.pie}>
                  <Text style={styles.fecha}>
                    {new Date(item.created_at).toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </Text>
                  <TouchableOpacity style={styles.botonEliminar} onPress={() => eliminar(item.id)}>
                    <Text style={styles.botonEliminarTexto}>Eliminar</Text>
                  </TouchableOpacity>
                </View>
              </View>
            );
          }}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  centrado: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  vacio: { fontSize: 16, color: '#999' },
  filtros: {
    flexDirection: 'row',
    padding: 16,
    paddingTop: 40,
    gap: 8,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  filtroPill: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: '#f0f0f0',
  },
  filtroPillActivo: { backgroundColor: '#C0392B' },
  filtroTexto: { fontSize: 12, fontWeight: '600', color: '#666' },
  filtroTextoActivo: { color: '#fff' },
  lista: { padding: 16, gap: 12 },
  tarjeta: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
  },
  cabecera: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 },
  titulo: { fontSize: 15, fontWeight: '700', color: '#1a1a1a', flex: 1, marginRight: 8 },
  estadoBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, borderRadius: 8, paddingHorizontal: 10, paddingVertical: 5 },
  estadoTexto: { fontSize: 12, fontWeight: '700' },
  descripcion: { fontSize: 14, color: '#555', lineHeight: 20, marginBottom: 12 },
  pie: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderTopWidth: 1, borderTopColor: '#f0f0f0', paddingTop: 10 },
  fecha: { fontSize: 12, color: '#999' },
  botonEliminar: { backgroundColor: '#FEE2E2', borderRadius: 8, paddingHorizontal: 12, paddingVertical: 6 },
  botonEliminarTexto: { color: '#C0392B', fontWeight: '700', fontSize: 13 },
});
