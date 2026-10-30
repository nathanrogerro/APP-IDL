import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { cores, espaco, raio } from '../constants/tema';
import { estilosDeCampo } from './Campo';

// "Chip" clicável. `ativo` = selecionado. `aoRemover` mostra um X (usado nos filtros ativos).
export function Chip({ rotulo, ativo = false, icone, onPress, aoRemover, papel = 'button' }) {
  return (
    <Pressable
      onPress={aoRemover || onPress}
      hitSlop={4}
      accessibilityRole={papel}
      accessibilityState={papel === 'radio' ? { selected: ativo } : undefined}
      accessibilityLabel={aoRemover ? `Remover filtro ${rotulo}` : rotulo}
      style={({ pressed }) => [estilos.chip, ativo && estilos.chipAtivo, pressed && estilos.pressionado]}
    >
      {icone ? <Ionicons name={icone} size={16} color={ativo ? cores.textoInverso : cores.textoSecundario} /> : null}
      <Text style={[estilos.chipTexto, ativo && estilos.chipTextoAtivo]}>{rotulo}</Text>
      {aoRemover ? <Ionicons name="close" size={16} color={ativo ? cores.textoInverso : cores.textoSecundario} /> : null}
    </Pressable>
  );
}

// Escolha única entre poucas opções (tipo, unidade, finalidade, perfil...).
export function Seletor({ opcoes, valor, onChange, rotulo, obrigatorio = false, erro, rolavel = false, estilo }) {
  const chips = opcoes.map((opcao) => (
    <Chip
      key={String(opcao.valor)}
      rotulo={opcao.rotulo}
      icone={opcao.icone}
      ativo={opcao.valor === valor}
      papel="radio"
      onPress={() => onChange(opcao.valor)}
    />
  ));
  return (
    <View style={[estilos.campo, estilo]} accessibilityRole="radiogroup" accessibilityLabel={rotulo}>
      {rotulo ? (
        <Text style={estilosDeCampo.rotulo}>
          {rotulo}
          {obrigatorio ? <Text style={estilosDeCampo.obrigatorio}> *</Text> : null}
        </Text>
      ) : null}
      {rolavel ? (
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={estilos.linha}>
          {chips}
        </ScrollView>
      ) : (
        <View style={[estilos.linha, estilos.quebra]}>{chips}</View>
      )}
      {erro ? <Text style={estilosDeCampo.erro}>{erro}</Text> : null}
    </View>
  );
}

const estilos = StyleSheet.create({
  campo: { marginBottom: espaco.lg },
  linha: { flexDirection: 'row', gap: espaco.sm, alignItems: 'center' },
  quebra: { flexWrap: 'wrap' },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    minHeight: 40,
    paddingHorizontal: espaco.md,
    borderRadius: raio.pilula,
    borderWidth: 1,
    borderColor: cores.bordaForte,
    backgroundColor: cores.superficie,
  },
  chipAtivo: { backgroundColor: cores.primaria, borderColor: cores.primaria },
  chipTexto: { fontSize: 14, fontWeight: '600', color: cores.textoSecundario },
  chipTextoAtivo: { color: cores.textoInverso },
  pressionado: { opacity: 0.8 },
});
