import { Redirect, Stack } from 'expo-router';
import { useAuth } from '../../context/AuthContext';
import { TelaCarregando } from '../../components/Estrutura';
import { cabecalhoPadrao } from '../../constants/navegacao';
import { cores } from '../../constants/tema';

// PORTEIRO das telas privadas (ADR-005): sem sessão, nenhuma tela deste grupo abre
// e o usuário é levado ao login. A proteção fica só aqui, e não em cada tela.
export default function LayoutPrivado() {
  const { usuario, carregando } = useAuth();
  if (carregando) return <TelaCarregando />;
  if (!usuario) return <Redirect href="/login" />;

  return (
    <Stack screenOptions={{ ...cabecalhoPadrao, contentStyle: { backgroundColor: cores.fundo } }}>
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="item/[id]" options={{ title: 'Item' }} />
      <Stack.Screen name="item/form" options={{ title: 'Cadastrar item' }} />
      <Stack.Screen name="item/foto" options={{ title: 'Cadastro por foto' }} />
      <Stack.Screen name="retirada/[itemId]" options={{ title: 'Retirada' }} />
      <Stack.Screen name="locais" options={{ title: 'Locais' }} />
      <Stack.Screen name="usuarios" options={{ title: 'Usuários' }} />
    </Stack>
  );
}
