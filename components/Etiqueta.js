import { StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { cores, espaco, raio } from '../constants/tema';
import { descreverValidade } from '../utils/datas';
import { formatarNumero } from '../utils/texto';

const TONS = {
  perigo: { fundo: cores.perigoFundo, texto: cores.perigo },
  alerta: { fundo: cores.alertaFundo, texto: cores.alerta },
  sucesso: { fundo: cores.sucessoFundo, texto: cores.sucesso },
  info: { fundo: cores.infoFundo, texto: cores.info },
  primaria: { fundo: cores.primariaClara, texto: cores.primariaEscura },
  neutro: { fundo: cores.superficieSuave, texto: cores.textoSecundario },
};

export function Etiqueta({ texto, tom = 'neutro', icone }) {
  const t = TONS[tom];
  return (
    <View style={[estilos.etiqueta, { backgroundColor: t.fundo }]}>
      {icone ? <Ionicons name={icone} size={13} color={t.texto} /> : null}
      <Text style={[estilos.texto, { color: t.texto }]}>{texto}</Text>
    </View>
  );
}

// Etiquetas de situação de um item: vencido, vencendo, abaixo do mínimo, emprestado (RF18, RF19, RF21).
export function EtiquetasDoItem({ item }) {
  const { status } = item;
  const etiquetas = [];
  if (status.validade === 'vencido') {
    etiquetas.push(<Etiqueta key="vencido" tom="perigo" icone="close-circle" texto="Vencido" />);
  } else if (status.validade === 'vencendo') {
    etiquetas.push(<Etiqueta key="vencendo" tom="alerta" icone="time-outline" texto={descreverValidade(item.validade)} />);
  }
  if (status.abaixoMinimo) {
    etiquetas.push(<Etiqueta key="minimo" tom="alerta" icone="trending-down" texto="Abaixo do mínimo" />);
  }
  if (status.emprestado > 0) {
    etiquetas.push(
      <Etiqueta key="emprestado" tom="info" icone="swap-horizontal" texto={`${formatarNumero(status.emprestado)} em empréstimo`} />
    );
  }
  if (!etiquetas.length) return null;
  return <View style={estilos.linha}>{etiquetas}</View>;
}

const estilos = StyleSheet.create({
  etiqueta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: espaco.sm,
    paddingVertical: 3,
    borderRadius: raio.pilula,
    alignSelf: 'flex-start',
  },
  texto: { fontSize: 12, fontWeight: '700' },
  linha: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: 6 },
});
