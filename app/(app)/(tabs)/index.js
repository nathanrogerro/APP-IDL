import { Pressable, RefreshControl, ScrollView, StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../../context/AuthContext';
import { usePainel } from '../../../hooks/usePainel';
import { EstadoLista } from '../../../components/EstadoLista';
import { LinhaMovimentacao } from '../../../components/LinhaMovimentacao';
import { Etiqueta } from '../../../components/Etiqueta';
import { Secao } from '../../../components/Estrutura';
import { PERFIS, rotuloDe } from '../../../constants/rotulos';
import { cores, espaco, fonte, raio, sombra } from '../../../constants/tema';
import { primeiroNome } from '../../../utils/texto';

const TONS = {
  perigo: { fundo: cores.perigoFundo, texto: cores.perigo },
  alerta: { fundo: cores.alertaFundo, texto: cores.alerta },
  info: { fundo: cores.infoFundo, texto: cores.info },
  primaria: { fundo: cores.primariaClara, texto: cores.primariaEscura },
};

function CartaoResumo({ numero, rotulo, icone, tom, onPress }) {
  const t = TONS[tom];
  const destaque = numero > 0 && (tom === 'perigo' || tom === 'alerta');
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`${rotulo}: ${numero}`}
      style={({ pressed }) => [estilos.resumo, destaque && { borderColor: t.texto }, pressed && { opacity: 0.85 }]}
    >
      <View style={[estilos.iconeResumo, { backgroundColor: t.fundo }]}>
        <Ionicons name={icone} size={20} color={t.texto} />
      </View>
      <Text style={[estilos.numero, destaque && { color: t.texto }]}>{numero}</Text>
      <Text style={estilos.rotuloResumo}>{rotulo}</Text>
    </Pressable>
  );
}

// Painel (RF24): totais com atalhos para o Inventário filtrado e para os Empréstimos
// (passagem de parâmetro `filtro`, PRD seção 9), e as movimentações recentes.
export default function Painel() {
  const { usuario } = useAuth();
  const painel = usePainel();
  const totais = painel.dados ? painel.dados.totais : null;
  const recentes = painel.dados ? painel.dados.recentes : [];

  const irParaInventario = (filtro) =>
    router.navigate(filtro ? { pathname: '/inventario', params: { filtro } } : '/inventario');

  return (
    <ScrollView
      contentContainerStyle={estilos.conteudo}
      refreshControl={<RefreshControl refreshing={painel.atualizando} onRefresh={painel.puxarParaAtualizar} />}
    >
      <View style={estilos.saudacao}>
        <Text style={estilos.ola} accessibilityRole="header">
          Olá, {primeiroNome(usuario.nome)}
        </Text>
        <Etiqueta tom="primaria" icone="shield-checkmark-outline" texto={rotuloDe(PERFIS, usuario.perfil)} />
      </View>

      <EstadoLista carregando={painel.carregando} erro={painel.erro} onTentarNovamente={painel.recarregar} compacto>
        {totais ? (
          <>
            <View style={estilos.grade}>
              <CartaoResumo numero={totais.vencidos} rotulo="Vencidos" icone="close-circle-outline" tom="perigo" onPress={() => irParaInventario('vencidos')} />
              <CartaoResumo
                numero={totais.vencendo}
                rotulo={`Vencendo em até ${painel.dados.diasAlerta} dias`}
                icone="time-outline"
                tom="alerta"
                onPress={() => irParaInventario('vencendo')}
              />
              <CartaoResumo
                numero={totais.atrasados}
                rotulo="Devoluções atrasadas"
                icone="alert-circle-outline"
                tom="perigo"
                onPress={() => router.navigate({ pathname: '/emprestimos', params: { filtro: 'atrasados' } })}
              />
              <CartaoResumo numero={totais.abaixoMinimo} rotulo="Abaixo do mínimo" icone="trending-down-outline" tom="alerta" onPress={() => irParaInventario('abaixo-minimo')} />
              <CartaoResumo
                numero={totais.emprestimosAbertos}
                rotulo="Empréstimos em aberto"
                icone="swap-horizontal-outline"
                tom="info"
                onPress={() => router.navigate({ pathname: '/emprestimos', params: { filtro: 'abertos' } })}
              />
              <CartaoResumo numero={totais.totalItens} rotulo="Itens no inventário" icone="flask-outline" tom="primaria" onPress={() => irParaInventario(null)} />
            </View>

            <Secao titulo="Movimentações recentes" estilo={{ marginTop: espaco.xl }}>
              <View style={estilos.cartaoLista}>
                <EstadoLista vazio={recentes.length === 0} mensagemVazio="Nenhuma movimentação registrada" iconeVazio="time-outline" compacto>
                  {recentes.map((m, i) => (
                    <LinhaMovimentacao
                      key={m.id}
                      movimentacao={m}
                      mostrarItem
                      ultima={i === recentes.length - 1}
                      onPress={m.tipo === 'exclusao' ? undefined : () => router.push(`/item/${m.itemId}`)}
                    />
                  ))}
                </EstadoLista>
              </View>
            </Secao>
          </>
        ) : null}
      </EstadoLista>
    </ScrollView>
  );
}

const estilos = StyleSheet.create({
  conteudo: { padding: espaco.lg, paddingBottom: espaco.xxl },
  saudacao: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: espaco.lg, gap: espaco.sm },
  ola: { fontSize: fonte.grande + 2, fontWeight: '800', color: cores.texto, flexShrink: 1 },
  grade: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', rowGap: espaco.md },
  resumo: {
    width: '48.5%',
    backgroundColor: cores.superficie,
    borderRadius: raio.lg,
    borderWidth: 1.5,
    borderColor: cores.borda,
    padding: espaco.md,
    minHeight: 120,
    ...sombra,
  },
  iconeResumo: { width: 36, height: 36, borderRadius: raio.md, alignItems: 'center', justifyContent: 'center' },
  numero: { fontSize: 28, fontWeight: '800', color: cores.texto, marginTop: espaco.sm },
  rotuloResumo: { fontSize: 13, color: cores.textoSecundario, fontWeight: '600' },
  cartaoLista: {
    backgroundColor: cores.superficie,
    borderRadius: raio.lg,
    borderWidth: 1,
    borderColor: cores.borda,
    padding: espaco.lg,
    paddingBottom: 0,
  },
});
