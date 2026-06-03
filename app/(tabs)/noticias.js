import { View, Text, StyleSheet } from 'react-native';

export default function Noticias() {
  return (
    <View style={styles.container}>
      <Text style={styles.titulo}>Noticias</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  titulo: { fontSize: 24, fontWeight: 'bold' },
});
