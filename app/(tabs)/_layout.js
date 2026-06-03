import { Tabs } from 'expo-router';

export default function TabsLayout() {
  return (
    <Tabs screenOptions={{ tabBarActiveTintColor: '#2e78b7' }}>
      <Tabs.Screen name="noticias" options={{ title: 'Noticias' }} />
      <Tabs.Screen name="eventos" options={{ title: 'Eventos' }} />
      <Tabs.Screen name="incidencias" options={{ title: 'Incidencias' }} />
      <Tabs.Screen name="comarca" options={{ title: 'Comarca' }} />
    </Tabs>
  );
}
