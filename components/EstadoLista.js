import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Botao } from './Botao';
import { cores, espaco, fonte } from '../constants/tema';

// Componente único para os estados de carregamento, erro e vazio de TODAS as listagens
// (RNF29, ADR-004). Quando não há nenhum desses estados, mostra `children` (a lista).
export function EstadoLista({
  carregando,
  erro,
  vazio,
  onTentarNovamente,
  mensagemVazio = 'Nada por aqui ainda.',
  descricaoVazio,
  iconeVazio = 'file-tray-outline',
  acaoVazio,
  compacto = false,
  children,
}) {
  if (carregando) {
    return (
      <View style={[estilos.centro, compacto && estilos.compacto]} accessibilityLabel="Carregando" accessibilityRole="progressbar">
        <ActivityIndicator size="large" color={cores.primaria} />
        <Text style={estilos.texto}>Carregando...</Text>
      </View>
    );
  }

  if (erro) {
    return (
      <View style={[estilos.centro, compacto && estilos.compacto]} accessibilityLiveRegion="polite">
        <Ionicons name="alert-circle-outline" size={40} color={cores.perigo} />
        <Text style={estilos.titulo}>Não foi possível carregar</Text>
        <Text style={estilos.texto}>{erro}</Text>
        {onTentarNovamente ? (
          <Botao titulo="Tentar novamente" icone="refresh" variante="secundario" compacto onPress={() => onTentarNovamente()} />
        ) : null}
      </View>
    );
  }

  if (vazio) {
    return (
      <View style={[estilos.centro, compacto && estilos.compacto]}>
        <Ionicons name={iconeVazio} size={40} color={cores.textoSuave} />
        <Text style={estilos.titulo}>{mensagemVazio}</Text>
        {descricaoVazio ? <Text style={estilos.texto}>{descricaoVazio}</Text> : null}
        {acaoVazio ? <Botao titulo={acaoVazio.titulo} icone={acaoVazio.icone} compacto onPress={acaoVazio.onPress} /> : null}
      </View>
    );
  }

  return children;
}

const estilos = StyleSheet.create({
  centro: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: espaco.xl, gap: espaco.md, minHeight: 240 },
  compacto: { flex: 0, minHeight: 0, paddingVertical: espaco.xl },
  titulo: { fontSize: fonte.media, fontWeight: '700', color: cores.texto, textAlign: 'center' },
  texto: { fontSize: fonte.normal, color: cores.textoSecundario, textAlign: 'center', maxWidth: 320 },
});
