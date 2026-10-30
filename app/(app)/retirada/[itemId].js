import { useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { router, Stack, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../../context/AuthContext';
import { useItem } from '../../../hooks/useItens';
import { useAcoesDeEmprestimo } from '../../../hooks/useEmprestimos';
import { EstadoLista } from '../../../components/EstadoLista';
import { Seletor } from '../../../components/Seletor';
import { CampoData } from '../../../components/CampoData';
import { estilosDeCampo } from '../../../components/Campo';
import { Botao } from '../../../components/Botao';
import { Aviso } from '../../../components/Aviso';
import { Cartao, Formulario } from '../../../components/Estrutura';
import { FINALIDADES } from '../../../constants/rotulos';
import { cores, espaco, fonte, raio, TOQUE_MINIMO } from '../../../constants/tema';
import { hojeISO, isoParaBr, somarDias } from '../../../utils/datas';
import { formatarNumero, formatarQuantidade, lerNumero } from '../../../utils/texto';
import { mostrarToast } from '../../../utils/toast';

const MODOS = [
  { valor: 'emprestimo', rotulo: 'Empréstimo', icone: 'swap-horizontal' },
  { valor: 'consumo', rotulo: 'Consumo', icone: 'water-outline' },
];

const ATALHOS_DE_DEVOLUCAO = [
  { rotulo: 'Hoje', dias: 0 },
  { rotulo: '+1 dia', dias: 1 },
  { rotulo: '+7 dias', dias: 7 },
  { rotulo: '+15 dias', dias: 15 },
];

// Retirada (RF14) e consumo (RF16) de um item. Recebe o parâmetro de rota `itemId`.
// Com os valores padrão (1 unidade, devolução em 7 dias), a retirada leva 2 toques a partir
// do detalhe do item: "Retirar" e "Confirmar retirada" (RNF25).
export default function Retirada() {
  const { itemId } = useLocalSearchParams();
  const { usuario } = useAuth();
  const item = useItem(itemId);
  const { retirar, consumir } = useAcoesDeEmprestimo();

  const [modo, setModo] = useState('emprestimo');
  const [quantidade, setQuantidade] = useState('1');
  const [finalidade, setFinalidade] = useState(FINALIDADES[0].valor);
  const [dataPrevista, setDataPrevista] = useState(isoParaBr(somarDias(hojeISO(), 7)));

  const acao = modo === 'emprestimo' ? retirar : consumir;
  const titulo = modo === 'consumo' ? 'Registrar consumo' : 'Retirada';
  const dados = item.dados;

  if (!dados) {
    return (
      <>
        <Stack.Screen options={{ title: titulo }} />
        <EstadoLista carregando={item.carregando} erro={item.erro} onTentarNovamente={item.recarregar} />
      </>
    );
  }

  const reagente = dados.tipo === 'reagente';

  function trocarModo(novo) {
    setModo(novo);
    retirar.limpar();
    consumir.limpar();
  }

  function alterarQuantidade(delta) {
    const atual = lerNumero(quantidade);
    const base = Number.isNaN(atual) ? 0 : atual;
    const nova = Math.max(1, Math.round((base + delta) * 1000) / 1000);
    setQuantidade(formatarNumero(nova));
    acao.limparCampo('quantidade');
  }

  async function confirmarRegistro() {
    const r =
      modo === 'emprestimo'
        ? await retirar.executar({ itemId: dados.id, quantidade, finalidade, dataPrevista })
        : await consumir.executar({ itemId: dados.id, quantidade, finalidade });
    if (r.ok) {
      mostrarToast(modo === 'emprestimo' ? 'Retirada registrada' : 'Consumo registrado');
      router.back();
    }
  }

  const temErroDeCampo = Object.keys(acao.campos).length > 0;

  return (
    <>
      <Stack.Screen options={{ title: titulo }} />
      <Formulario>
        <Cartao estilo={{ marginBottom: espaco.lg }}>
          <Text style={estilos.nome}>{dados.nome}</Text>
          <Text style={estilos.detalhe}>
            Disponível: <Text style={estilos.destaque}>{formatarQuantidade(dados.quantidade, dados.unidade)}</Text>
          </Text>
          <Text style={estilos.detalhe}>{dados.localDescricao}</Text>
        </Cartao>

        {dados.status.semSaldo ? <Aviso tom="alerta" texto="Este item está sem saldo disponível para retirada." /> : null}
        {acao.erro && !temErroDeCampo ? <Aviso tom="perigo" texto={acao.erro} /> : null}

        {reagente ? <Seletor rotulo="Tipo de registro" opcoes={MODOS} valor={modo} onChange={trocarModo} /> : null}
        {modo === 'consumo' ? (
          <Aviso tom="info" texto="O consumo dá baixa na quantidade, sem empréstimo e sem devolução." />
        ) : null}

        <View style={estilos.campo}>
          <Text style={estilosDeCampo.rotulo}>
            Quantidade<Text style={estilosDeCampo.obrigatorio}> *</Text>
          </Text>
          <View style={estilos.contador}>
            <Pressable onPress={() => alterarQuantidade(-1)} style={estilos.botaoContador} accessibilityRole="button" accessibilityLabel="Diminuir quantidade">
              <Ionicons name="remove" size={22} color={cores.primaria} />
            </Pressable>
            <TextInput
              value={quantidade}
              onChangeText={(t) => {
                setQuantidade(t);
                acao.limparCampo('quantidade');
              }}
              keyboardType="decimal-pad"
              style={[estilos.entradaContador, acao.campos.quantidade && { borderColor: cores.perigo }]}
              accessibilityLabel="Quantidade"
              textAlign="center"
            />
            <Pressable onPress={() => alterarQuantidade(1)} style={estilos.botaoContador} accessibilityRole="button" accessibilityLabel="Aumentar quantidade">
              <Ionicons name="add" size={22} color={cores.primaria} />
            </Pressable>
          </View>
          {acao.campos.quantidade ? <Text style={estilosDeCampo.erro}>{acao.campos.quantidade}</Text> : null}
        </View>

        <Seletor
          rotulo="Finalidade"
          obrigatorio={modo === 'emprestimo'}
          opcoes={FINALIDADES}
          valor={finalidade}
          onChange={(v) => {
            setFinalidade(v);
            acao.limparCampo('finalidade');
          }}
          erro={acao.campos.finalidade}
        />

        <View style={estilos.campo}>
          <Text style={estilosDeCampo.rotulo}>Responsável</Text>
          <View style={estilos.responsavel}>
            <Ionicons name="person-circle-outline" size={22} color={cores.textoSecundario} />
            <Text style={estilos.textoResponsavel}>{usuario.nome} (você)</Text>
          </View>
        </View>

        {modo === 'emprestimo' ? (
          <CampoData
            rotulo="Data prevista de devolução"
            obrigatorio
            valor={dataPrevista}
            onChange={(v) => {
              setDataPrevista(v);
              acao.limparCampo('dataPrevista');
            }}
            erro={acao.campos.dataPrevista}
            atalhos={ATALHOS_DE_DEVOLUCAO}
          />
        ) : null}

        <Botao
          titulo={modo === 'emprestimo' ? 'Confirmar retirada' : 'Registrar consumo'}
          icone="checkmark-circle-outline"
          desabilitado={dados.status.semSaldo}
          carregando={acao.executando}
          onPress={confirmarRegistro}
        />
      </Formulario>
    </>
  );
}

const estilos = StyleSheet.create({
  nome: { fontSize: fonte.media, fontWeight: '800', color: cores.texto },
  detalhe: { fontSize: 14, color: cores.textoSecundario, marginTop: 4 },
  destaque: { fontWeight: '700', color: cores.texto },
  campo: { marginBottom: espaco.lg },
  contador: { flexDirection: 'row', alignItems: 'center', gap: espaco.sm },
  botaoContador: {
    width: TOQUE_MINIMO,
    height: TOQUE_MINIMO,
    borderRadius: raio.md,
    borderWidth: 1.5,
    borderColor: cores.primaria,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: cores.superficie,
  },
  entradaContador: {
    width: 96,
    minHeight: TOQUE_MINIMO,
    borderWidth: 1,
    borderColor: cores.bordaForte,
    borderRadius: raio.md,
    backgroundColor: cores.superficie,
    fontSize: fonte.media,
    fontWeight: '700',
    color: cores.texto,
  },
  responsavel: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: espaco.sm,
    minHeight: TOQUE_MINIMO,
    paddingHorizontal: espaco.md,
    borderRadius: raio.md,
    backgroundColor: cores.superficieSuave,
  },
  textoResponsavel: { fontSize: fonte.normal, color: cores.texto, fontWeight: '600' },
});
