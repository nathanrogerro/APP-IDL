import { useState } from 'react';
import { RefreshControl, ScrollView, StyleSheet, Text, View } from 'react-native';
import { router, Stack, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../../context/AuthContext';
import { useAcoesDoItem, useHistoricoDoItem, useItem } from '../../../hooks/useItens';
import { useAcoesDeEmprestimo, useEmprestimosDoItem } from '../../../hooks/useEmprestimos';
import { EstadoLista } from '../../../components/EstadoLista';
import { EtiquetasDoItem } from '../../../components/Etiqueta';
import { LinhaMovimentacao } from '../../../components/LinhaMovimentacao';
import { CartaoEmprestimo } from '../../../components/CartaoEmprestimo';
import { Botao } from '../../../components/Botao';
import { Aviso } from '../../../components/Aviso';
import { Cartao, LinhaInfo, Secao } from '../../../components/Estrutura';
import { TIPOS_ITEM } from '../../../constants/rotulos';
import { cores, espaco, fonte, raio } from '../../../constants/tema';
import { descreverValidade, formatarDataHora, isoParaBr } from '../../../utils/datas';
import { formatarNumero, formatarQuantidade } from '../../../utils/texto';
import { confirmar } from '../../../utils/confirmar';
import { mostrarToast } from '../../../utils/toast';

// Detalhe do item. Recebe o parâmetro de rota `id` (ADR-005) e mostra dados, situação,
// empréstimos abertos e o histórico de movimentação (RF23, US09).
export default function DetalheDoItem() {
  const { id } = useLocalSearchParams();
  const { pode } = useAuth();
  const item = useItem(id);
  const historico = useHistoricoDoItem(id);
  const emprestimos = useEmprestimosDoItem(id);
  const { excluir } = useAcoesDoItem();
  const { devolver } = useAcoesDeEmprestimo();
  const [devolvendoId, setDevolvendoId] = useState(null);

  const dados = item.dados;
  const titulo = dados ? dados.nome : 'Item';

  function recarregarTudo() {
    item.recarregar();
    historico.recarregar();
    emprestimos.recarregar();
  }

  async function excluirItem() {
    const ok = await confirmar({
      titulo: 'Excluir item',
      mensagem: `"${dados.nome}" deixará de aparecer no inventário. O histórico de movimentação será mantido.`,
      textoConfirmar: 'Excluir',
      destrutivo: true,
    });
    if (!ok) return;
    const r = await excluir.executar(dados.id);
    if (r.ok) {
      mostrarToast('Item excluído');
      router.back();
    }
  }

  async function registrarDevolucao(emprestimo) {
    const ok = await confirmar({
      titulo: 'Registrar devolução',
      mensagem: `Confirmar a devolução (retirado por ${emprestimo.usuarioNome})?`,
      textoConfirmar: 'Devolver',
    });
    if (!ok) return;
    setDevolvendoId(emprestimo.id);
    const r = await devolver.executar(emprestimo.id);
    setDevolvendoId(null);
    if (r.ok) {
      mostrarToast('Devolução registrada');
      recarregarTudo();
    } else {
      mostrarToast(r.erro, 'erro');
    }
  }

  if (!dados) {
    return (
      <>
        <Stack.Screen options={{ title: titulo }} />
        <EstadoLista carregando={item.carregando} erro={item.erro} onTentarNovamente={item.recarregar} />
      </>
    );
  }

  const tipo = TIPOS_ITEM.find((t) => t.valor === dados.tipo);
  const { status } = dados;
  const corValidade =
    status.validade === 'vencido' ? cores.perigo : status.validade === 'vencendo' ? cores.alerta : undefined;
  const listaHistorico = historico.dados || [];

  return (
    <>
      <Stack.Screen options={{ title: titulo }} />
      <ScrollView
        contentContainerStyle={estilos.conteudo}
        refreshControl={<RefreshControl refreshing={item.atualizando} onRefresh={recarregarTudo} />}
      >
        <Cartao>
          <View style={estilos.tipo}>
            <Ionicons name={tipo.icone} size={16} color={cores.primariaEscura} />
            <Text style={estilos.textoTipo}>{tipo.rotulo}</Text>
          </View>
          <Text style={estilos.nome} accessibilityRole="header">
            {dados.nome}
          </Text>
          <EtiquetasDoItem item={dados} />

          <View style={estilos.saldo}>
            <View>
              <Text style={estilos.rotuloSaldo}>Disponível</Text>
              <Text style={[estilos.numeroSaldo, status.semSaldo && { color: cores.perigo }]}>
                {formatarQuantidade(dados.quantidade, dados.unidade)}
              </Text>
            </View>
            {status.emprestado > 0 ? (
              <View style={{ alignItems: 'flex-end' }}>
                <Text style={estilos.rotuloSaldo}>Em empréstimo</Text>
                <Text style={estilos.numeroEmprestado}>{formatarNumero(status.emprestado)}</Text>
              </View>
            ) : null}
          </View>

          {excluir.erro ? <Aviso tom="perigo" texto={excluir.erro} estilo={{ marginTop: espaco.md, marginBottom: 0 }} /> : null}

          <Botao
            titulo={status.semSaldo ? 'Sem saldo para retirada' : 'Retirar'}
            icone="arrow-up-circle-outline"
            desabilitado={status.semSaldo}
            onPress={() => router.push(`/retirada/${dados.id}`)}
            estilo={{ marginTop: espaco.lg }}
          />
          {pode('editarItens') ? (
            <View style={estilos.acoes}>
              <Botao
                titulo="Editar"
                icone="create-outline"
                variante="secundario"
                estilo={{ flex: 1 }}
                onPress={() => router.push({ pathname: '/item/form', params: { id: dados.id } })}
              />
              <Botao
                titulo="Excluir"
                icone="trash-outline"
                variante="perigo"
                estilo={{ flex: 1 }}
                carregando={excluir.executando}
                onPress={excluirItem}
              />
            </View>
          ) : null}
        </Cartao>

        <Secao titulo="Informações" estilo={{ marginTop: espaco.xl }}>
          <Cartao estilo={{ paddingVertical: espaco.xs }}>
            <LinhaInfo rotulo="Local" valor={dados.localDescricao} />
            <LinhaInfo
              rotulo="Validade"
              valor={dados.validade ? `${isoParaBr(dados.validade)} · ${descreverValidade(dados.validade)}` : null}
              destaque={corValidade}
            />
            <LinhaInfo rotulo="Fabricante" valor={dados.fabricante} />
            <LinhaInfo rotulo="Concentração" valor={dados.concentracao} />
            <LinhaInfo rotulo="Lote" valor={dados.lote} />
            <LinhaInfo rotulo="Número CAS" valor={dados.cas} />
            <LinhaInfo
              rotulo="Estoque mínimo"
              valor={dados.estoqueMinimo !== null ? formatarQuantidade(dados.estoqueMinimo, dados.unidade) : null}
              destaque={status.abaixoMinimo ? cores.alerta : undefined}
            />
            <LinhaInfo rotulo="Observações" valor={dados.observacoes} />
            <LinhaInfo rotulo="Cadastrado" valor={formatarDataHora(dados.criadoEm)} ultima />
          </Cartao>
        </Secao>

        {/* A seção só aparece se houver empréstimo aberto, mas carregamento e erro também são mostrados (RNF29). */}
        {emprestimos.carregando || emprestimos.erro || (emprestimos.dados && emprestimos.dados.length) ? (
          <Secao titulo="Empréstimos em aberto">
            <EstadoLista
              carregando={emprestimos.carregando}
              erro={emprestimos.erro}
              onTentarNovamente={emprestimos.recarregar}
              compacto
            >
              <View style={{ gap: espaco.md }}>
                {(emprestimos.dados || []).map((e) => (
                  <CartaoEmprestimo
                    key={e.id}
                    emprestimo={e}
                    mostrarItem={false}
                    onDevolver={() => registrarDevolucao(e)}
                    devolvendo={devolvendoId === e.id}
                  />
                ))}
              </View>
            </EstadoLista>
          </Secao>
        ) : null}

        <Secao titulo="Histórico de movimentações">
          <View style={estilos.cartaoHistorico}>
            <EstadoLista
              carregando={historico.carregando}
              erro={historico.erro}
              vazio={historico.vazio}
              onTentarNovamente={historico.recarregar}
              mensagemVazio="Nenhuma movimentação registrada"
              iconeVazio="time-outline"
              compacto
            >
              {listaHistorico.map((m, i) => (
                <LinhaMovimentacao key={m.id} movimentacao={m} unidade={dados.unidade} ultima={i === listaHistorico.length - 1} />
              ))}
            </EstadoLista>
          </View>
        </Secao>
      </ScrollView>
    </>
  );
}

const estilos = StyleSheet.create({
  conteudo: { padding: espaco.lg, paddingBottom: espaco.xxl },
  tipo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    alignSelf: 'flex-start',
    backgroundColor: cores.primariaClara,
    borderRadius: raio.pilula,
    paddingHorizontal: espaco.sm,
    paddingVertical: 3,
  },
  textoTipo: { color: cores.primariaEscura, fontWeight: '700', fontSize: 12 },
  nome: { fontSize: fonte.grande + 2, fontWeight: '800', color: cores.texto, marginTop: espaco.sm },
  saldo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: espaco.lg,
    padding: espaco.md,
    borderRadius: raio.md,
    backgroundColor: cores.superficieSuave,
  },
  rotuloSaldo: { fontSize: 13, color: cores.textoSecundario, fontWeight: '600' },
  numeroSaldo: { fontSize: fonte.grande + 2, fontWeight: '800', color: cores.texto, marginTop: 2 },
  numeroEmprestado: { fontSize: fonte.grande + 2, fontWeight: '800', color: cores.info, marginTop: 2 },
  acoes: { flexDirection: 'row', gap: espaco.md, marginTop: espaco.md },
  cartaoHistorico: {
    backgroundColor: cores.superficie,
    borderRadius: raio.lg,
    borderWidth: 1,
    borderColor: cores.borda,
    padding: espaco.lg,
    paddingBottom: 0,
  },
});
