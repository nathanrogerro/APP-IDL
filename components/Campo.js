import { StyleSheet, Text, TextInput, View } from 'react-native';
import { cores, espaco, fonte, raio, TOQUE_MINIMO } from '../constants/tema';

// Campo de texto com rótulo, marcação de obrigatório, dica e mensagem de erro (US04).
// `children` aparece logo abaixo da caixa de texto (ex.: atalhos de data).
export function Campo({ rotulo, obrigatorio = false, erro, dica, multilinha = false, estilo, children, ...props }) {
  return (
    <View style={[estilos.campo, estilo]}>
      {rotulo ? (
        <Text style={estilos.rotulo}>
          {rotulo}
          {obrigatorio ? <Text style={estilos.obrigatorio}> *</Text> : null}
        </Text>
      ) : null}
      <TextInput
        placeholderTextColor={cores.textoSuave}
        multiline={multilinha}
        textAlignVertical={multilinha ? 'top' : 'center'}
        accessibilityLabel={rotulo}
        accessibilityHint={erro || dica}
        style={[estilos.entrada, multilinha && estilos.multilinha, erro && estilos.entradaComErro]}
        {...props}
      />
      {children}
      {erro ? (
        <Text style={estilos.erro} accessibilityLiveRegion="polite">
          {erro}
        </Text>
      ) : dica ? (
        <Text style={estilos.dica}>{dica}</Text>
      ) : null}
    </View>
  );
}

export const estilosDeCampo = StyleSheet.create({
  rotulo: { fontSize: 14, fontWeight: '600', color: cores.texto, marginBottom: espaco.xs + 2 },
  obrigatorio: { color: cores.perigo },
  erro: { color: cores.perigo, fontSize: 13, marginTop: espaco.xs, fontWeight: '500' },
  dica: { color: cores.textoSecundario, fontSize: 13, marginTop: espaco.xs },
});

const estilos = StyleSheet.create({
  campo: { marginBottom: espaco.lg },
  ...estilosDeCampo,
  entrada: {
    minHeight: TOQUE_MINIMO,
    borderWidth: 1,
    borderColor: cores.bordaForte,
    borderRadius: raio.md,
    backgroundColor: cores.superficie,
    paddingHorizontal: espaco.md,
    paddingVertical: espaco.sm,
    fontSize: fonte.normal,
    color: cores.texto,
  },
  multilinha: { minHeight: 96, paddingTop: espaco.md },
  entradaComErro: { borderColor: cores.perigo, borderWidth: 1.5 },
});
