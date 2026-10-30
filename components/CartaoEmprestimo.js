import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Botao } from './Botao';
import { Etiqueta } from './Etiqueta';
import { cores, espaco, fonte, raio, sombra } from '../constants/tema';
import { isoParaBr } from '../utils/datas';
import { formatarNumero } from '../utils/texto';

function situacao(e) {
  if (e.atrasado) {
    return { tom: 'perigo', icone: 'alert-circle', texto: `Atrasado ${e.diasDeAtraso} ${e.diasDeAtraso === 1 ? 'dia' : 'dias'}` };
  }
  if (e.diasRestantes === 0) return { tom: 'alerta', icone: 'time-outline', texto: 'Devolver hoje' };
  return { tom: 'info', icone: 'calendar-outline', texto: `Faltam ${e.diasRestantes} ${e.diasRestantes === 1 ? 'dia' : 'dias'}` };
}

// Empréstimo aberto, com destaque para atrasados (RF17) e botão de devolução (RF15).
export function CartaoEmprestimo({ emprestimo: e, onPress, onDevolver, devolvendo = false, mostrarItem = true }) {
  const s = situacao(e);
  // A área de informações e o botão de devolução são toques separados (um botão não fica
  // dentro do outro, o que confundiria leitores de tela).
  return (
    <View style={[estilos.cartao, e.atrasado && estilos.atrasado]}>
      <Pressable
        onPress={onPress}
        disabled={!onPress}
        accessibilityRole={onPress ? 'button' : undefined}
        accessibilityLabel={onPress ? `${e.itemNome}, ${s.texto}. Abrir item` : undefined}
        style={({ pressed }) => [estilos.topo, pressed && onPress && { opacity: 0.85 }]}
      >
        <View style={{ flex: 1 }}>
          {mostrarItem ? (
            <Text style={estilos.item} numberOfLines={2}>
              {e.itemNome}
            </Text>
          ) : null}
          <Text style={estilos.linha}>
            <Ionicons name="person-outline" size={13} color={cores.textoSecundario} /> {e.usuarioNome} · Qtd.: {formatarNumero(e.quantidade)}
          </Text>
          <Text style={estilos.linha}>
            Retirado em {isoParaBr(e.dataRetirada)} · Devolver até {isoParaBr(e.dataPrevista)}
          </Text>
          {e.finalidade ? <Text style={estilos.linha}>Finalidade: {e.finalidade}</Text> : null}
        </View>
        <Etiqueta tom={s.tom} icone={s.icone} texto={s.texto} />
      </Pressable>
      {onDevolver ? (
        <Botao
          titulo="Registrar devolução"
          icone="arrow-down-circle-outline"
          variante="secundario"
          compacto
          carregando={devolvendo}
          onPress={onDevolver}
          estilo={estilos.botao}
          rotuloAcessivel={`Registrar devolução de ${e.itemNome}`}
        />
      ) : null}
    </View>
  );
}

const estilos = StyleSheet.create({
  cartao: {
    backgroundColor: cores.superficie,
    borderRadius: raio.lg,
    padding: espaco.md,
    borderWidth: 1,
    borderColor: cores.borda,
    ...sombra,
  },
  atrasado: { borderColor: cores.perigoBorda, borderLeftWidth: 5, borderLeftColor: cores.perigo },
  topo: { flexDirection: 'row', gap: espaco.sm, alignItems: 'flex-start' },
  item: { fontSize: fonte.normal + 1, fontWeight: '700', color: cores.texto, marginBottom: 4 },
  linha: { fontSize: 13, color: cores.textoSecundario, marginTop: 2 },
  botao: { marginTop: espaco.md, alignSelf: 'flex-start' },
});
