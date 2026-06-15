import { Image, View, TouchableOpacity, Platform } from 'react-native';
import { Tabs, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const COLORES = {
  noticias: '#1B4D3E',
  eventos: '#1A5276',
  incidencias: '#C0392B',
  comarca: '#6C3483',
};

function IconoImagen({ fuente, focused, color }) {
  return (
    <Image
      source={fuente}
      style={{
        width: 28,
        height: 28,
        opacity: focused ? 1 : 0.4,
        tintColor: focused ? color : '#999',
      }}
      resizeMode="contain"
    />
  );
}

function LogoCabecera() {
  return (
    <View style={{ marginLeft: 16 }}>
      <Image
        source={require('../../assets/logo.png')}
        style={{ width: 45, height: 45, tintColor: '#fff' }}
        resizeMode="contain"
      />
    </View>
  );
}

function BotonAdmin() {
  const router = useRouter();
  return (
    <TouchableOpacity
      onPress={() => router.push('/login')}
      style={{ marginRight: 16, padding: 8 }}
      activeOpacity={0.7}
    >
      <Ionicons name="lock-closed-outline" size={24} color="#fff" />
    </TouchableOpacity>
  );
}

export default function TabsLayout() {
  const insets = useSafeAreaInsets();

  return (
    <Tabs
      screenOptions={{
        tabBarStyle: {
          backgroundColor: '#fff',
          borderTopWidth: 1,
          borderTopColor: '#f0f0f0',
          height: Platform.OS === 'ios' ? 95 : 75 + insets.bottom,
          paddingBottom: insets.bottom > 0 ? insets.bottom + 5 : 15,
          paddingTop: 10,
        },
        tabBarLabelStyle: {
          fontSize: 14, // Letras grandes como pediste
          fontWeight: '800',
        },
        headerTitleStyle: {
          fontWeight: '900',
          fontSize: 19,
          letterSpacing: 1,
        },
        headerTitleAlign: 'center',
      }}
    >
      <Tabs.Screen
        name="noticias/index"
        options={{
          tabBarLabel: 'Noticias', // Texto barra inferior
          headerTitle: 'NOTICIAS', // Texto cabecera superior
          tabBarActiveTintColor: COLORES.noticias,
          tabBarIcon: ({ focused }) => (
            <IconoImagen fuente={require('../../assets/icono_altavoz.png')} focused={focused} color={COLORES.noticias} />
          ),
          headerStyle: { backgroundColor: COLORES.noticias },
          headerTintColor: '#fff',
          headerLeft: () => <LogoCabecera />,
          headerRight: () => <BotonAdmin />,
        }}
      />

      <Tabs.Screen
        name="eventos/index"
        options={{
          tabBarLabel: 'Eventos', // Texto barra inferior
          headerTitle: 'EVENTOS', // Texto cabecera superior
          tabBarActiveTintColor: COLORES.eventos,
          tabBarIcon: ({ focused }) => (
            <IconoImagen fuente={require('../../assets/icono_calendario.png')} focused={focused} color={COLORES.eventos} />
          ),
          headerStyle: { backgroundColor: COLORES.eventos },
          headerTintColor: '#fff',
          headerLeft: () => <LogoCabecera />,
          headerRight: () => <BotonAdmin />,
        }}
      />

      <Tabs.Screen
        name="incidencias"
        options={{
          tabBarLabel: 'Incidencias', // <--- CAMBIADO: Ahora solo pone esto abajo
          headerTitle: 'INCIDENCIAS', // Título de la cabecera
          tabBarActiveTintColor: COLORES.incidencias,
          tabBarIcon: ({ focused }) => (
            <IconoImagen fuente={require('../../assets/icono_exclamacion.png')} focused={focused} color={COLORES.incidencias} />
          ),
          headerStyle: { backgroundColor: COLORES.incidencias },
          headerTintColor: '#fff',
          headerLeft: () => <LogoCabecera />,
          headerRight: () => <BotonAdmin />,
        }}
      />

      <Tabs.Screen
        name="comarca/index"
        options={{
          tabBarLabel: 'Comarca', // Texto barra inferior
          headerTitle: 'COMARCA', // Texto cabecera superior
          tabBarActiveTintColor: COLORES.comarca,
          tabBarIcon: ({ focused }) => (
            <IconoImagen fuente={require('../../assets/icono_comarca.png')} focused={focused} color={COLORES.comarca} />
          ),
          headerStyle: { backgroundColor: COLORES.comarca },
          headerTintColor: '#fff',
          headerLeft: () => <LogoCabecera />,
          headerRight: () => <BotonAdmin />,
        }}
      />

      <Tabs.Screen name="noticias/[id]" options={{ href: null }} />
      <Tabs.Screen name="eventos/[id]" options={{ href: null }} />
      <Tabs.Screen name="comarca/[id]" options={{ href: null }} />
      <Tabs.Screen name="admin" options={{ href: null }} />
    </Tabs>
  );
}
