import { Image, View } from 'react-native';
import { Tabs } from 'expo-router';

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
        width: 34,
        height: 34,
        opacity: focused ? 1 : 0.4,
        tintColor: focused ? color : '#999',
      }}
      resizeMode="contain"
    />
  );
}

function LogoCabecera() {
  return (
    <View style={{ marginLeft: 16, marginRight: 8 }}>
      <Image
        source={require('../../assets/logo.png')}
        style={{ width: 58, height: 58, tintColor: '#fff' }}
        resizeMode="contain"
      />
    </View>
  );
}

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarStyle: {
          backgroundColor: '#fff',
          borderTopWidth: 0.5,
          borderTopColor: '#ddd',
          height: 110,
          paddingBottom: 50,
          paddingTop: 8,
        },
        tabBarLabelStyle: { fontSize: 13, fontWeight: '700', marginBottom: 6, },
      }}
    >
      <Tabs.Screen
        name="noticias/index"
        options={{
          title: 'Noticias',
          tabBarActiveTintColor: COLORES.noticias,
          tabBarInactiveTintColor: '#999',
          tabBarIcon: ({ focused }) => (
            <IconoImagen
              fuente={require('../../assets/icono_altavoz.png')}
              focused={focused}
              color={COLORES.noticias}
            />
          ),
          headerStyle: { backgroundColor: COLORES.noticias },
          headerTintColor: '#fff',
          headerTitleStyle: { fontWeight: 'bold', fontSize: 18 },
          headerLeft: () => <LogoCabecera />,
        }}
      />
      <Tabs.Screen
        name="eventos"
        options={{
          title: 'Eventos',
          tabBarActiveTintColor: COLORES.eventos,
          tabBarInactiveTintColor: '#999',
          tabBarIcon: ({ focused }) => (
            <IconoImagen
              fuente={require('../../assets/icono_calendario.png')}
              focused={focused}
              color={COLORES.eventos}
            />
          ),
          headerStyle: { backgroundColor: COLORES.eventos },
          headerTintColor: '#fff',
          headerTitleStyle: { fontWeight: 'bold', fontSize: 18 },
          headerLeft: () => <LogoCabecera />,
        }}
      />
      <Tabs.Screen
        name="incidencias"
        options={{
          title: 'Incidencias',
          tabBarActiveTintColor: COLORES.incidencias,
          tabBarInactiveTintColor: '#999',
          tabBarIcon: ({ focused }) => (
            <IconoImagen
              fuente={require('../../assets/icono_exclamacion.png')}
              focused={focused}
              color={COLORES.incidencias}
            />
          ),
          headerStyle: { backgroundColor: COLORES.incidencias },
          headerTintColor: '#fff',
          headerTitleStyle: { fontWeight: 'bold', fontSize: 18 },
          headerLeft: () => <LogoCabecera />,
        }}
      />
      <Tabs.Screen
        name="comarca"
        options={{
          title: 'Comarca',
          tabBarActiveTintColor: COLORES.comarca,
          tabBarInactiveTintColor: '#999',
          tabBarIcon: ({ focused }) => (
            <IconoImagen
              fuente={require('../../assets/icono_comarca.png')}
              focused={focused}
              color={COLORES.comarca}
            />
          ),
          headerStyle: { backgroundColor: COLORES.comarca },
          headerTintColor: '#fff',
          headerTitleStyle: { fontWeight: 'bold', fontSize: 18 },
          headerLeft: () => <LogoCabecera />,
        }}
      />
      <Tabs.Screen
        name="noticias/[id]"
        options={{ href: null }}
      />
    </Tabs>
  );
}
