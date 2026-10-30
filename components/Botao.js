import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { cores, espaco, fonte, raio, TOQUE_MINIMO } from '../constants/tema';

const VARIANTES = {
  primario: { fundo: cores.primaria, texto: cores.textoInverso, borda: cores.primaria },
  secundario: { fundo: cores.superficie, texto: cores.primaria, borda: cores.primaria },
  perigo: { fundo: cores.superficie, texto: cores.perigo, borda: cores.perigoBorda },
  discreto: { fundo: 'transparent', texto: cores.primaria, borda: 'transparent' },
};

export function Botao({
  titulo,
  onPress,
  variante = 'primario',
  icone,
  carregando = false,
  desabilitado = false,
  compacto = false,
  estilo,
  rotuloAcessivel,
}) {
  const v = VARIANTES[variante];
  const inativo = desabilitado || carregando;
  return (
    <Pressable
      onPress={onPress}
      disabled={inativo}
      hitSlop={compacto ? 4 : 0}
      accessibilityRole="button"
      accessibilityLabel={rotuloAcessivel || titulo}
      accessibilityState={{ disabled: inativo, busy: carregando }}
      style={({ pressed }) => [
        estilos.base,
        compacto && estilos.compacto,
        { backgroundColor: v.fundo, borderColor: v.borda },
        inativo && estilos.inativo,
        pressed && !inativo && estilos.pressionado,
        estilo,
      ]}
    >
      {carregando ? (
        <ActivityIndicator color={v.texto} />
      ) : (
        <View style={estilos.conteudo}>
          {icone ? <Ionicons name={icone} size={compacto ? 18 : 20} color={v.texto} /> : null}
          <Text style={[estilos.texto, compacto && estilos.textoCompacto, { color: v.texto }]}>{titulo}</Text>
        </View>
      )}
    </Pressable>
  );
}

const estilos = StyleSheet.create({
  base: {
    minHeight: TOQUE_MINIMO,
    borderRadius: raio.md,
    borderWidth: 1.5,
    paddingHorizontal: espaco.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  compacto: { minHeight: 40, paddingHorizontal: espaco.md },
  conteudo: { flexDirection: 'row', alignItems: 'center', gap: espaco.sm },
  texto: { fontSize: fonte.normal, fontWeight: '700' },
  textoCompacto: { fontSize: 14 },
  inativo: { opacity: 0.5 },
  pressionado: { opacity: 0.85 },
});
