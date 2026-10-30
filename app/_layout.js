import { StyleSheet, Text, View } from 'react-native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { AuthProvider } from '../context/AuthContext';
import { usePrepararBanco } from '../hooks/useBanco';
import { TelaCarregando } from '../components/Estrutura';
import { Botao } from '../components/Botao';
import { Toast } from '../components/Toast';
import { cores, espaco, fonte } from '../constants/tema';

// Layout raiz (ADR-005): prepara o banco local e fornece a sessão
// (AuthContext) para o app inteiro.
export default function LayoutRaiz() {
  const banco = usePrepararBanco();

  let conteudo;
  if (banco.erro) {
    conteudo = (
      <View style={estilos.erro}>
        <Ionicons name="alert-circle-outline" size={44} color={cores.perigo} />
        <Text style={estilos.titulo}>Não foi possível iniciar o app</Text>
        <Text style={estilos.texto}>{banco.erro}</Text>
        <Botao titulo="Tentar novamente" icone="refresh" onPress={banco.tentarNovamente} />
      </View>
    );
  } else if (!banco.pronto) {
    conteudo = <TelaCarregando texto="Preparando o banco local..." />;
  } else {
    conteudo = (
      <AuthProvider>
        <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: cores.fundo } }} />
        <Toast />
      </AuthProvider>
    );
  }

  return (
    <SafeAreaProvider>
      <StatusBar style="light" />
      {conteudo}
    </SafeAreaProvider>
  );
}

const estilos = StyleSheet.create({
  erro: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: espaco.md, padding: espaco.xl, backgroundColor: cores.fundo },
  titulo: { fontSize: fonte.grande, fontWeight: '800', color: cores.texto, textAlign: 'center' },
  texto: { fontSize: fonte.normal, color: cores.textoSecundario, textAlign: 'center' },
});
