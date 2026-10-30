import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { cores, espaco, fonte, raio, TOQUE_MINIMO } from '../constants/tema';

// Painel de opções que sobe da parte de baixo da tela.
// opcoes: [{ titulo, descricao, icone, onPress }]
export function MenuDeAcoes({ visivel, titulo, opcoes, aoFechar }) {
  const insets = useSafeAreaInsets();
  return (
    <Modal visible={visivel} transparent animationType="slide" onRequestClose={aoFechar}>
      <Pressable style={estilos.fundo} onPress={aoFechar} accessibilityLabel="Fechar" />
      <View style={[estilos.painel, { paddingBottom: insets.bottom + espaco.md }]}>
        {titulo ? <Text style={estilos.titulo}>{titulo}</Text> : null}
        {opcoes.map((opcao) => (
          <Pressable
            key={opcao.titulo}
            onPress={() => {
              aoFechar();
              opcao.onPress();
            }}
            accessibilityRole="button"
            style={({ pressed }) => [estilos.opcao, pressed && { backgroundColor: cores.superficieSuave }]}
          >
            <View style={estilos.icone}>
              <Ionicons name={opcao.icone} size={22} color={cores.primaria} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={estilos.tituloOpcao}>{opcao.titulo}</Text>
              {opcao.descricao ? <Text style={estilos.descricao}>{opcao.descricao}</Text> : null}
            </View>
            <Ionicons name="chevron-forward" size={18} color={cores.textoSuave} />
          </Pressable>
        ))}
      </View>
    </Modal>
  );
}

const estilos = StyleSheet.create({
  fundo: { flex: 1, backgroundColor: 'rgba(15, 23, 42, 0.45)' },
  painel: {
    backgroundColor: cores.superficie,
    borderTopLeftRadius: raio.lg + 4,
    borderTopRightRadius: raio.lg + 4,
    paddingTop: espaco.lg,
  },
  titulo: { fontSize: fonte.media, fontWeight: '700', color: cores.texto, paddingHorizontal: espaco.lg, marginBottom: espaco.sm },
  opcao: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: espaco.md,
    minHeight: TOQUE_MINIMO + 16,
    paddingHorizontal: espaco.lg,
  },
  icone: {
    width: 44,
    height: 44,
    borderRadius: raio.md,
    backgroundColor: cores.primariaClara,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tituloOpcao: { fontSize: fonte.normal, fontWeight: '700', color: cores.texto },
  descricao: { fontSize: 13, color: cores.textoSecundario, marginTop: 2 },
});
