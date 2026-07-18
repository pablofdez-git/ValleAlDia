import { Redirect } from 'expo-router';

export default function Index() {
  // Redirigimos a la ruta de noticias dentro de (tabs)
  return <Redirect href="/noticias" />;
}
