import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { TIPOS_MOVIMENTACAO } from '../constants/rotulos';
import { cores, espaco, fonte } from '../constants/tema';
import { formatarDataHora } from '../utils/datas';
import { formatarQuantidade } from '../utils/texto';

const COR_POR_TIPO = {
  cadastro: cores.primaria,
  edicao: cores.info,
  retirada: cores.alerta,
  devolucao: cores.sucesso,
  consumo: cores.alerta,
  exclusao: cores.perigo,
};

// Uma linha do histórico de movimentação (RF23). Não tem ação de editar nem apagar (US09).
//   mostrarItem: inclui o nome do item no título (Painel)
//   unidade: se informada, mostra a quantidade com a unidade (detalhe do item)
export function LinhaMovimentacao({ movimentacao: m, mostrarItem = false, unidade, onPress, ultima = false }) {
  const tipo = TIPOS_MOVIMENTACAO[m.tipo] || { rotulo: m.tipo, icone: 'ellipse-outline' };
  const cor = COR_POR_TIPO[m.tipo] || cores.textoSecundario;
  let titulo = mostrarItem ? `${tipo.rotulo}: ${m.itemNome}` : tipo.rotulo;
  if (unidade && m.quantidade !== null && m.quantidade !== undefined && m.tipo !== 'cadastro') {
    titulo += ` · ${formatarQuantidade(m.quantidade, unidade)}`;
  }
  const conteudo = (
    <>
      <View style={estilos.trilho}>
        <View style={[estilos.bolinha, { borderColor: cor }]}>
          <Ionicons name={tipo.icone} size={16} color={cor} />
        </View>
        {!ultima ? <View style={estilos.linhaVertical} /> : null}
      </View>
      <View style={estilos.corpo}>
        <Text style={estilos.titulo} numberOfLines={2}>
          {titulo}
        </Text>
        <Text style={estilos.meta}>
          {m.usuarioNome ? `Por: ${m.usuarioNome} • ` : ''}
          {formatarDataHora(m.dataHora)}
        </Text>
        {m.observacao ? <Text style={estilos.observacao}>{m.observacao}</Text> : null}
      </View>
    </>
  );
  if (onPress) {
    return (
      <Pressable onPress={onPress} accessibilityRole="button" style={({ pressed }) => [estilos.linha, pressed && { opacity: 0.8 }]}>
        {conteudo}
      </Pressable>
    );
  }
  return <View style={estilos.linha}>{conteudo}</View>;
}

const estilos = StyleSheet.create({
  linha: { flexDirection: 'row', gap: espaco.md, minHeight: 56 },
  trilho: { alignItems: 'center', width: 32 },
  bolinha: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 2,
    backgroundColor: cores.superficie,
    alignItems: 'center',
    justifyContent: 'center',
  },
  linhaVertical: { flex: 1, width: 2, backgroundColor: cores.borda, marginVertical: 2 },
  corpo: { flex: 1, paddingBottom: espaco.lg },
  titulo: { fontSize: fonte.normal, fontWeight: '700', color: cores.texto },
  meta: { fontSize: 13, color: cores.textoSecundario, marginTop: 2 },
  observacao: { fontSize: 13, color: cores.texto, marginTop: 4 },
});
