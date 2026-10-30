import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { cores, espaco, fonte, raio, sombra } from '../constants/tema';

// Peças de estrutura reaproveitadas nas telas.

// Tela de formulário: rolagem que acompanha o teclado.
// `referencia` permite rolar até o topo para mostrar as mensagens de erro.
export function Formulario({ children, estilo, referencia }) {
  const insets = useSafeAreaInsets();
  return (
    <ScrollView
      ref={referencia}
      style={estilos.tela}
      contentContainerStyle={[estilos.conteudo, { paddingBottom: insets.bottom + espaco.xxl }, estilo]}
      keyboardShouldPersistTaps="handled"
      automaticallyAdjustKeyboardInsets
    >
      {children}
    </ScrollView>
  );
}

export function TelaCarregando({ texto = 'Carregando...' }) {
  return (
    <View style={[estilos.tela, estilos.centro]}>
      <ActivityIndicator size="large" color={cores.primaria} />
      <Text style={estilos.textoCarregando}>{texto}</Text>
    </View>
  );
}

export function Secao({ titulo, acao, children, estilo }) {
  return (
    <View style={[estilos.secao, estilo]}>
      <View style={estilos.cabecalhoSecao}>
        <Text style={estilos.tituloSecao} accessibilityRole="header">
          {titulo}
        </Text>
        {acao || null}
      </View>
      {children}
    </View>
  );
}

export function Cartao({ children, estilo }) {
  return <View style={[estilos.cartao, estilo]}>{children}</View>;
}

// Linha "rótulo: valor" do detalhe do item.
export function LinhaInfo({ rotulo, valor, icone, destaque, ultima = false }) {
  if (valor === null || valor === undefined || valor === '') return null;
  return (
    <View style={[estilos.linhaInfo, !ultima && estilos.linhaInfoBorda]}>
      {icone ? <Ionicons name={icone} size={18} color={cores.textoSecundario} style={{ marginTop: 1 }} /> : null}
      <Text style={estilos.rotuloInfo}>{rotulo}</Text>
      <Text style={[estilos.valorInfo, destaque && { color: destaque, fontWeight: '700' }]}>{valor}</Text>
    </View>
  );
}

// Botão redondo flutuante (ex.: "+" do Inventário).
export function BotaoFlutuante({ icone = 'add', onPress, rotulo }) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={rotulo}
      style={({ pressed }) => [estilos.flutuante, pressed && { opacity: 0.85 }]}
    >
      <Ionicons name={icone} size={28} color={cores.textoInverso} />
    </Pressable>
  );
}

// Mostrada quando o perfil do usuário não permite acessar a tela (matriz de permissões, ADR-005).
export function SemPermissao({ aoVoltar }) {
  return (
    <View style={[estilos.tela, estilos.centro, { padding: espaco.xl }]}>
      <Ionicons name="lock-closed-outline" size={44} color={cores.textoSuave} />
      <Text style={estilos.tituloSecao}>Acesso não permitido</Text>
      <Text style={[estilos.textoCarregando, { textAlign: 'center' }]}>
        O seu perfil não tem permissão para usar esta tela.
      </Text>
      {aoVoltar ? (
        <Pressable onPress={aoVoltar} accessibilityRole="button" style={estilos.voltar}>
          <Text style={estilos.textoVoltar}>Voltar</Text>
        </Pressable>
      ) : null}
    </View>
  );
}

// Item de menu em lista (tela Perfil).
export function ItemDeMenu({ icone, titulo, descricao, onPress, direita, ultimo = false }) {
  return (
    <Pressable
      onPress={onPress}
      disabled={!onPress}
      accessibilityRole={onPress ? 'button' : undefined}
      style={({ pressed }) => [estilos.itemMenu, !ultimo && estilos.linhaInfoBorda, pressed && { opacity: 0.8 }]}
    >
      <Ionicons name={icone} size={22} color={cores.primaria} />
      <View style={{ flex: 1 }}>
        <Text style={estilos.tituloMenu}>{titulo}</Text>
        {descricao ? <Text style={estilos.descricaoMenu}>{descricao}</Text> : null}
      </View>
      {direita !== undefined ? direita : onPress ? <Ionicons name="chevron-forward" size={18} color={cores.textoSuave} /> : null}
    </Pressable>
  );
}

const estilos = StyleSheet.create({
  tela: { flex: 1, backgroundColor: cores.fundo },
  conteudo: { padding: espaco.lg },
  centro: { alignItems: 'center', justifyContent: 'center', gap: espaco.md },
  textoCarregando: { color: cores.textoSecundario, fontSize: fonte.normal },
  secao: { marginBottom: espaco.xl },
  cabecalhoSecao: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: espaco.md,
    gap: espaco.sm,
  },
  tituloSecao: { fontSize: fonte.media, fontWeight: '800', color: cores.texto, flexShrink: 1 },
  cartao: {
    backgroundColor: cores.superficie,
    borderRadius: raio.lg,
    borderWidth: 1,
    borderColor: cores.borda,
    padding: espaco.lg,
    ...sombra,
  },
  linhaInfo: { flexDirection: 'row', alignItems: 'flex-start', gap: espaco.sm, paddingVertical: espaco.md },
  linhaInfoBorda: { borderBottomWidth: 1, borderBottomColor: cores.borda },
  rotuloInfo: { width: 112, fontSize: 14, color: cores.textoSecundario },
  valorInfo: { flex: 1, fontSize: fonte.normal, color: cores.texto },
  flutuante: {
    position: 'absolute',
    right: espaco.lg,
    bottom: espaco.lg,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: cores.primaria,
    alignItems: 'center',
    justifyContent: 'center',
    ...sombra,
    shadowOpacity: 0.25,
    elevation: 6,
  },
  voltar: { minHeight: 48, justifyContent: 'center', paddingHorizontal: espaco.xl },
  textoVoltar: { color: cores.primaria, fontWeight: '700', fontSize: fonte.normal },
  itemMenu: { flexDirection: 'row', alignItems: 'center', gap: espaco.md, minHeight: 56, paddingVertical: espaco.sm },
  tituloMenu: { fontSize: fonte.normal, fontWeight: '600', color: cores.texto },
  descricaoMenu: { fontSize: 13, color: cores.textoSecundario, marginTop: 2 },
});
