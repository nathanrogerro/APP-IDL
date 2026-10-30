import { useEffect, useState } from 'react';
import { FlatList, RefreshControl, ScrollView, StyleSheet, View } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { useEmprestimos, useAcoesDeEmprestimo } from '../../../hooks/useEmprestimos';
import { EstadoLista } from '../../../components/EstadoLista';
import { CartaoEmprestimo } from '../../../components/CartaoEmprestimo';
import { Chip } from '../../../components/Seletor';
import { confirmar } from '../../../utils/confirmar';
import { mostrarToast } from '../../../utils/toast';
import { cores, espaco } from '../../../constants/tema';

const FILTROS = [
  { valor: 'abertos', rotulo: 'Em aberto', vazio: 'Nenhum empréstimo em aberto' },
  { valor: 'atrasados', rotulo: 'Atrasados', vazio: 'Nenhuma devolução atrasada' },
  { valor: 'meus', rotulo: 'Meus', vazio: 'Você não tem empréstimos em aberto' },
];

function filtroValido(valor) {
  return FILTROS.some((f) => f.valor === valor) ? valor : null;
}

// Empréstimos em aberto, com atrasados em destaque (RF17) e devolução (RF15, US06).
// Recebe `filtro` do Painel ("Devoluções atrasadas").
export default function Emprestimos() {
  const params = useLocalSearchParams();
  const [filtro, setFiltro] = useState(filtroValido(params.filtro) || 'abertos');
  const lista = useEmprestimos(filtro);
  const { devolver } = useAcoesDeEmprestimo();
  const [devolvendoId, setDevolvendoId] = useState(null);

  useEffect(() => {
    const vindoDoPainel = filtroValido(params.filtro);
    if (vindoDoPainel) setFiltro(vindoDoPainel);
  }, [params.filtro]);

  function trocarFiltro(valor) {
    setFiltro(valor);
    if (params.filtro) router.setParams({ filtro: '' });
  }

  async function registrarDevolucao(emprestimo) {
    const ok = await confirmar({
      titulo: 'Registrar devolução',
      mensagem: `Confirmar a devolução de "${emprestimo.itemNome}" (retirado por ${emprestimo.usuarioNome})?`,
      textoConfirmar: 'Devolver',
    });
    if (!ok) return;
    setDevolvendoId(emprestimo.id);
    const r = await devolver.executar(emprestimo.id);
    setDevolvendoId(null);
    if (r.ok) {
      const atraso = r.resultado.atraso;
      mostrarToast(
        atraso > 0 ? `Devolução registrada com ${atraso} ${atraso === 1 ? 'dia' : 'dias'} de atraso` : 'Devolução registrada'
      );
      lista.recarregar();
    } else {
      mostrarToast(r.erro, 'erro');
    }
  }

  const textoVazio = FILTROS.find((f) => f.valor === filtro).vazio;

  return (
    <View style={estilos.tela}>
      <View style={estilos.filtros}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={estilos.linhaChips}>
          {FILTROS.map((f) => (
            <Chip key={f.valor} rotulo={f.rotulo} ativo={filtro === f.valor} papel="radio" onPress={() => trocarFiltro(f.valor)} />
          ))}
        </ScrollView>
      </View>
      <EstadoLista
        carregando={lista.carregando}
        erro={lista.erro}
        vazio={lista.vazio}
        onTentarNovamente={lista.recarregar}
        mensagemVazio={textoVazio}
        iconeVazio="checkmark-done-outline"
      >
        <FlatList
          data={lista.dados}
          keyExtractor={(e) => e.id}
          renderItem={({ item }) => (
            <CartaoEmprestimo
              emprestimo={item}
              onPress={() => router.push(`/item/${item.itemId}`)}
              onDevolver={() => registrarDevolucao(item)}
              devolvendo={devolvendoId === item.id}
            />
          )}
          ItemSeparatorComponent={() => <View style={{ height: espaco.md }} />}
          contentContainerStyle={estilos.lista}
          refreshControl={<RefreshControl refreshing={lista.atualizando} onRefresh={lista.puxarParaAtualizar} />}
        />
      </EstadoLista>
    </View>
  );
}

const estilos = StyleSheet.create({
  tela: { flex: 1, backgroundColor: cores.fundo },
  filtros: {
    backgroundColor: cores.superficie,
    paddingHorizontal: espaco.lg,
    paddingVertical: espaco.md,
    borderBottomWidth: 1,
    borderBottomColor: cores.borda,
  },
  linhaChips: { gap: espaco.sm },
  lista: { padding: espaco.lg, paddingBottom: espaco.xxl },
});
