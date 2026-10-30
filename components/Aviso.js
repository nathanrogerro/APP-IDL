import { StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { cores, espaco, raio } from '../constants/tema';

const TONS = {
  info: { fundo: cores.infoFundo, borda: cores.infoBorda, texto: cores.info, icone: 'information-circle' },
  alerta: { fundo: cores.alertaFundo, borda: cores.alertaBorda, texto: cores.alerta, icone: 'warning' },
  perigo: { fundo: cores.perigoFundo, borda: cores.perigoBorda, texto: cores.perigo, icone: 'alert-circle' },
  sucesso: { fundo: cores.sucessoFundo, borda: cores.sucessoBorda, texto: cores.sucesso, icone: 'checkmark-circle' },
};

// Caixa de mensagem dentro da tela (erro ao salvar, aviso de duplicidade...).
export function Aviso({ tom = 'info', titulo, texto, children, estilo }) {
  const t = TONS[tom];
  return (
    <View
      style={[estilos.caixa, { backgroundColor: t.fundo, borderColor: t.borda }, estilo]}
      accessibilityLiveRegion="polite"
      accessibilityRole={tom === 'perigo' ? 'alert' : undefined}
    >
      <Ionicons name={t.icone} size={22} color={t.texto} />
      <View style={{ flex: 1 }}>
        {titulo ? <Text style={[estilos.titulo, { color: t.texto }]}>{titulo}</Text> : null}
        {texto ? <Text style={[estilos.texto, { color: t.texto }]}>{texto}</Text> : null}
        {children}
      </View>
    </View>
  );
}

const estilos = StyleSheet.create({
  caixa: {
    flexDirection: 'row',
    gap: espaco.sm,
    borderWidth: 1,
    borderRadius: raio.md,
    padding: espaco.md,
    marginBottom: espaco.lg,
  },
  titulo: { fontWeight: '700', fontSize: 15, marginBottom: 2 },
  texto: { fontSize: 14, lineHeight: 20 },
});
