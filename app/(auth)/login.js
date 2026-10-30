import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../context/AuthContext';
import { useAcao } from '../../hooks/useAcao';
import { Campo } from '../../components/Campo';
import { Botao } from '../../components/Botao';
import { Aviso } from '../../components/Aviso';
import { cores, espaco, fonte, raio, TOQUE_MINIMO } from '../../constants/tema';

// Contas de exemplo listadas no README (modo de desenvolvimento / Expo Go).
const CONTAS_DE_EXEMPLO = [
  { rotulo: 'Administrador', email: 'admin@labsto.dev' },
  { rotulo: 'Técnico', email: 'tecnico@labsto.dev' },
  { rotulo: 'Estudante', email: 'estudante@labsto.dev' },
];

// RF01 / US01. Ao entrar, o layout (auth) redireciona para o Painel.
export default function Login() {
  const insets = useSafeAreaInsets();
  const { entrar } = useAuth();
  const acao = useAcao(entrar);
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');

  const enviar = () => acao.executar(email, senha);
  const temErroDeCampo = Object.keys(acao.campos).length > 0;

  return (
    <View style={estilos.tela}>
      <ScrollView
        contentContainerStyle={[estilos.conteudo, { paddingTop: insets.top + espaco.xxl, paddingBottom: insets.bottom + espaco.xl }]}
        keyboardShouldPersistTaps="handled"
        automaticallyAdjustKeyboardInsets
      >
        <View style={estilos.marca}>
          <View style={estilos.logo}>
            <Ionicons name="flask" size={34} color={cores.destaque} />
          </View>
          <Text style={estilos.nomeApp} accessibilityRole="header">
            LabSto
          </Text>
          <Text style={estilos.slogan}>Inventário do laboratório: reagentes, validade e empréstimos.</Text>
        </View>

        <View style={estilos.cartao}>
          <Text style={estilos.titulo}>Entrar</Text>
          {acao.erro && !temErroDeCampo ? <Aviso tom="perigo" texto={acao.erro} /> : null}
          <Campo
            rotulo="E-mail"
            value={email}
            onChangeText={(t) => {
              setEmail(t);
              acao.limparCampo('email');
            }}
            erro={acao.campos.email}
            placeholder="nome@instituicao.edu.br"
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
            autoComplete="email"
            textContentType="emailAddress"
            returnKeyType="next"
          />
          <Campo
            rotulo="Senha"
            value={senha}
            onChangeText={(t) => {
              setSenha(t);
              acao.limparCampo('senha');
            }}
            erro={acao.campos.senha}
            secureTextEntry
            autoCapitalize="none"
            autoComplete="password"
            textContentType="password"
            returnKeyType="go"
            onSubmitEditing={enviar}
          />
          <Botao titulo="Entrar" icone="log-in-outline" onPress={enviar} carregando={acao.executando} />
          <Pressable onPress={() => router.push('/recuperar-senha')} style={estilos.link} accessibilityRole="link">
            <Text style={estilos.textoLink}>Esqueceu a senha?</Text>
          </Pressable>
          <View style={estilos.divisor} />
          <Botao titulo="Criar conta" variante="secundario" icone="person-add-outline" onPress={() => router.push('/cadastro')} />
        </View>

        {__DEV__ ? (
          <View style={estilos.exemplos}>
            <Text style={estilos.tituloExemplos}>Contas de exemplo (qualquer senha)</Text>
            <View style={estilos.linhaExemplos}>
              {CONTAS_DE_EXEMPLO.map((conta) => (
                <Pressable
                  key={conta.email}
                  onPress={() => {
                    setEmail(conta.email);
                    setSenha('exemplo123');
                    acao.limpar();
                  }}
                  accessibilityRole="button"
                  accessibilityLabel={`Preencher com a conta de exemplo ${conta.rotulo}`}
                  style={({ pressed }) => [estilos.exemplo, pressed && { opacity: 0.8 }]}
                >
                  <Text style={estilos.textoExemplo}>{conta.rotulo}</Text>
                </Pressable>
              ))}
            </View>
          </View>
        ) : null}
      </ScrollView>
    </View>
  );
}

const estilos = StyleSheet.create({
  tela: { flex: 1, backgroundColor: cores.cabecalho },
  conteudo: { flexGrow: 1, justifyContent: 'center', paddingHorizontal: espaco.xl },
  marca: { alignItems: 'center', marginBottom: espaco.xl },
  logo: {
    width: 68,
    height: 68,
    borderRadius: raio.lg + 4,
    backgroundColor: 'rgba(45, 212, 191, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(45, 212, 191, 0.35)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: espaco.md,
  },
  nomeApp: { fontSize: fonte.titulo + 4, fontWeight: '800', color: cores.textoInverso },
  slogan: { fontSize: fonte.normal, color: '#CBD5E1', textAlign: 'center', marginTop: espaco.xs },
  cartao: { backgroundColor: cores.superficie, borderRadius: raio.lg + 4, padding: espaco.xl },
  titulo: { fontSize: fonte.grande, fontWeight: '800', color: cores.texto, marginBottom: espaco.lg },
  link: { minHeight: TOQUE_MINIMO, alignItems: 'center', justifyContent: 'center', marginTop: espaco.xs },
  textoLink: { color: cores.primaria, fontWeight: '700', fontSize: fonte.normal },
  divisor: { height: 1, backgroundColor: cores.borda, marginBottom: espaco.lg },
  exemplos: { marginTop: espaco.xl, alignItems: 'center' },
  tituloExemplos: { color: '#CBD5E1', fontSize: 13, marginBottom: espaco.sm },
  linhaExemplos: { flexDirection: 'row', flexWrap: 'wrap', gap: espaco.sm, justifyContent: 'center' },
  exemplo: {
    minHeight: 40,
    paddingHorizontal: espaco.md,
    borderRadius: raio.pilula,
    borderWidth: 1,
    borderColor: 'rgba(45, 212, 191, 0.5)',
    justifyContent: 'center',
  },
  textoExemplo: { color: cores.destaque, fontWeight: '700', fontSize: 14 },
});
