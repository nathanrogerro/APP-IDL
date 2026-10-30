import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { EtiquetasDoItem } from './Etiqueta';
import { TIPOS_ITEM } from '../constants/rotulos';
import { cores, espaco, fonte, raio, sombra } from '../constants/tema';
import { formatarNumero, formatarQuantidade } from '../utils/texto';

export function CartaoItem({ item, onPress }) {
  const tipo = TIPOS_ITEM.find((t) => t.valor === item.tipo) || TIPOS_ITEM[0];
  const unidade = formatarQuantidade(item.quantidade, item.unidade).split(' ').slice(1).join(' ');
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`${item.nome}. ${formatarQuantidade(item.quantidade, item.unidade)} disponíveis. ${item.localDescricao}`}
      style={({ pressed }) => [estilos.cartao, pressed && estilos.pressionado]}
    >
      <View style={estilos.icone}>
        <Ionicons name={tipo.icone} size={22} color={cores.primaria} />
      </View>
      <View style={estilos.corpo}>
        <Text style={estilos.nome} numberOfLines={2}>
          {item.nome}
        </Text>
        <Text style={estilos.local} numberOfLines={1}>
          {item.localDescricao}
        </Text>
        <EtiquetasDoItem item={item} />
      </View>
      <View style={estilos.quantidade}>
        <Text style={[estilos.numero, item.status.semSaldo && estilos.numeroZerado]}>{formatarNumero(item.quantidade)}</Text>
        <Text style={estilos.unidade}>{unidade}</Text>
      </View>
    </Pressable>
  );
}

const estilos = StyleSheet.create({
  cartao: {
    flexDirection: 'row',
    gap: espaco.md,
    backgroundColor: cores.superficie,
    borderRadius: raio.lg,
    padding: espaco.md,
    borderWidth: 1,
    borderColor: cores.borda,
    ...sombra,
  },
  pressionado: { opacity: 0.85 },
  icone: {
    width: 44,
    height: 44,
    borderRadius: raio.md,
    backgroundColor: cores.primariaClara,
    alignItems: 'center',
    justifyContent: 'center',
  },
  corpo: { flex: 1 },
  nome: { fontSize: fonte.normal + 1, fontWeight: '700', color: cores.texto },
  local: { fontSize: 13, color: cores.textoSecundario, marginTop: 2 },
  quantidade: { alignItems: 'flex-end', justifyContent: 'center', minWidth: 56 },
  numero: { fontSize: fonte.grande, fontWeight: '800', color: cores.texto },
  numeroZerado: { color: cores.perigo },
  unidade: { fontSize: 12, color: cores.textoSecundario },
});
