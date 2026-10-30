import { Redirect, Stack } from 'expo-router';
import { useAuth } from '../../context/AuthContext';
import { TelaCarregando } from '../../components/Estrutura';
import { cabecalhoPadrao } from '../../constants/navegacao';
import { cores } from '../../constants/tema';

// Telas públicas: login, cadastro e recuperação de senha.
// Quem já tem sessão aberta vai direto para o Painel.
export default function LayoutPublico() {
  const { usuario, carregando } = useAuth();
  if (carregando) return <TelaCarregando />;
  if (usuario) return <Redirect href="/" />;

  return (
    <Stack screenOptions={{ ...cabecalhoPadrao, contentStyle: { backgroundColor: cores.fundo } }}>
      <Stack.Screen name="login" options={{ headerShown: false }} />
      <Stack.Screen name="cadastro" options={{ title: 'Criar conta' }} />
      <Stack.Screen name="recuperar-senha" options={{ title: 'Recuperar senha' }} />
    </Stack>
  );
}
