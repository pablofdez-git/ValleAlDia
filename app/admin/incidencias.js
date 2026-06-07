import { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator, TouchableOpacity, Alert, Image } from 'react-native';
import { supabase } from '../../lib/supabase';

// Configuración de colores y emojis para cada estado
const ESTADOS = {
  pendiente: { bg: '#FEF3C7', text: '#92400E', icono: '🕐' },
  revisada: { bg: '#DBEAFE', text: '#1E40AF', icono: '👁️' },
  resuelta: { bg: '#D1FAE5', text: '#065F46', icono: '✅' },
};

export default function VerIncidencias() {
  const [incidencias, setIncidencias] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [filtro, setFiltro] = useState('todas');

  useEffect(() => {
    cargar();
  }, []);

  async function cargar() {
    setCargando(true);
    const { data, error } = await supabase
      .from('incidencias')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error(error);
      Alert.alert('Error', 'No se pudieron cargar las incidencias');
    } else {
      setIncidencias(data);
    }
    setCargando(false);
  }

  async function cambiarEstado(id, estadoActual) {
    const opciones = ['pendiente', 'revisada', 'resuelta'].filter(e => e !== estadoActual);

    Alert.alert('Cambiar estado', 'Selecciona el nuevo estado para esta incidencia:', [
      ...opciones.map(nuevoEstado => ({
        text: nuevoEstado.charAt(0).toUpperCase() + nuevoEstado.slice(1),
        onPress: async () => {
          const { error } = await supabase
            .from('incidencias')
            .update({ estado: nuevoEstado })
            .eq('id', id);
          if (!error) cargar();
        }
      })),
      { text: 'Cancelar', style: 'cancel' }
    ]);
  }

  async function eliminar(id) {
    Alert.alert('Eliminar', '¿Seguro que quieres borrar este reporte?', [
      {
        text: 'Eliminar',
        style: 'destructive',
        onPress: async () => {
          const { error } = await supabase.from('incidencias').delete().eq('id', id);
          if (!error) cargar();
        }
      },
      { text: 'Cancelar', style: 'cancel' }
    ]);
  }

  const incidenciasFiltradas = filtro === 'todas'
    ? incidencias
    : incidencias.filter(i => i.estado === filtro);

  if (cargando) {
    return (
      <View style={styles.centrado}>
        <ActivityIndicator size="large" color="#C0392B" />
        <Text style={{ marginTop: 10, color: '#666' }}>Cargando incidencias...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Barra de Filtros */}
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
          <Text style={styles.vacio}>No hay incidencias {filtro !== 'todas' ? filtro : ''}</Text>
        </View>
      ) : (
        <FlatList
          data={incidenciasFiltradas}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={styles.lista}
          renderItem={({ item }) => {
            const estadoConfig = ESTADOS[item.estado] || ESTADOS.pendiente;
            return (
              <View style={styles.tarjeta}>
                <View style={styles.cabecera}>
                  <Text style={styles.tituloItem}>{item.titulo}</Text>
                  <TouchableOpacity
                    style={[styles.estadoBadge, { backgroundColor: estadoConfig.bg }]}
                    onPress={() => cambiarEstado(item.id, item.estado)}
                  >
                    <Text style={{ fontSize: 12 }}>{estadoConfig.icono} {item.estado.toUpperCase()}</Text>
                  </TouchableOpacity>
                </View>

                {/* IMAGEN ADJUNTA (Si existe) */}
                {item.imagen_url && (
                  <Image
                    source={{ uri: item.imagen_url }}
                    style={styles.imagenAdjunta}
                    resizeMode="cover"
                  />
                )}

                <Text style={styles.descripcion}>{item.descripcion}</Text>

                <View style={styles.pie}>
                  <Text style={styles.fecha}>
                    {new Date(item.created_at).toLocaleDateString('es-ES', {
                        day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit'
                    })}
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
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  centrado: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  vacio: { fontSize: 16, color: '#999' },
  filtros: {
    flexDirection: 'row',
    padding: 16,
    paddingTop: 50, // Espacio para el notch
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
  lista: { padding: 16, gap: 16 },
  tarjeta: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  cabecera: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12
  },
  tituloItem: { fontSize: 17, fontWeight: '800', color: '#1a1a1a', flex: 1, marginRight: 8 },
  estadoBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  imagenAdjunta: {
    width: '100%',
    height: 200,
    borderRadius: 12,
    marginBottom: 12,
    backgroundColor: '#eee'
  },
  descripcion: { fontSize: 15, color: '#444', lineHeight: 22, marginBottom: 16 },
  pie: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    paddingTop: 12
  },
  fecha: { fontSize: 12, color: '#999' },
  botonEliminar: {
    backgroundColor: '#FEE2E2',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8
  },
  botonEliminarTexto: { color: '#C0392B', fontWeight: '700', fontSize: 13 },
});
