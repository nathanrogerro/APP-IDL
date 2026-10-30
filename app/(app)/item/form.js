import { useEffect, useRef, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { router, Stack, useLocalSearchParams } from 'expo-router';
import { useAuth } from '../../../context/AuthContext';
import { itemParaFormulario, useAcoesDoItem, useItemParaEdicao } from '../../../hooks/useItens';
import { Campo } from '../../../components/Campo';
import { CampoData } from '../../../components/CampoData';
import { Seletor } from '../../../components/Seletor';
import { SeletorLocal } from '../../../components/SeletorLocal';
import { Botao } from '../../../components/Botao';
import { Aviso } from '../../../components/Aviso';
import { EstadoLista } from '../../../components/EstadoLista';
import { Formulario, SemPermissao } from '../../../components/Estrutura';
import { TIPOS_ITEM, UNIDADES } from '../../../constants/rotulos';
import { cores, espaco } from '../../../constants/tema';
import { mostrarToast } from '../../../utils/toast';

const VAZIO = {
  tipo: 'reagente',
  nome: '',
  quantidade: '',
  unidade: 'frasco',
  localId: null,
  localDescricao: '',
  fabricante: '',
  concentracao: '',
  lote: '',
  cas: '',
  validade: '',
  estoqueMinimo: '',
  observacoes: '',
};

// Cadastro manual (RF07, US04) e edição (RF11) de item. Parâmetro opcional `id`:
// presente = edição. Só Administrador e Técnico podem abrir (matriz de permissões).
export default function FormularioDeItem() {
  const { id } = useLocalSearchParams();
  const editando = typeof id === 'string' && id.length > 0;
  const { pode } = useAuth();
  const existente = useItemParaEdicao(editando ? id : null);
  const { criar, atualizar } = useAcoesDoItem();
  const acao = editando ? atualizar : criar;

  const [form, setForm] = useState(VAZIO);
  const preenchido = useRef(false);
  const rolagem = useRef(null);

  // Na edição, preenche o formulário uma única vez, quando o item carrega.
  useEffect(() => {
    if (editando && existente.dados && !preenchido.current) {
      preenchido.current = true;
      setForm(itemParaFormulario(existente.dados));
    }
  }, [editando, existente.dados]);

  if (!pode('editarItens')) return <SemPermissao aoVoltar={() => router.back()} />;

  const titulo = editando ? 'Editar item' : 'Cadastrar item';
  if (editando && !preenchido.current) {
    return (
      <>
        <Stack.Screen options={{ title: titulo }} />
        <EstadoLista carregando={existente.carregando} erro={existente.erro} onTentarNovamente={existente.recarregar} />
      </>
    );
  }

  function alterar(campo, valor) {
    setForm((f) => ({ ...f, [campo]: valor }));
    acao.limparCampo(campo);
  }

  async function salvar(confirmarDuplicado = false) {
    const r = editando
      ? await atualizar.executar(id, form, { confirmarDuplicado })
      : await criar.executar(form, { confirmarDuplicado });
    if (!r.ok) {
      // Leva o usuário ao topo, onde estão o aviso e os primeiros campos com erro.
      if (rolagem.current) rolagem.current.scrollTo({ y: 0, animated: true });
      return;
    }
    if (editando) {
      mostrarToast('Alterações salvas');
      router.back();
    } else {
      mostrarToast('Item cadastrado');
      router.replace(`/item/${r.resultado.id}`);
    }
  }

  const reagente = form.tipo === 'reagente';
  const erros = acao.campos;
  const temErroDeCampo = Object.keys(erros).length > 0;

  return (
    <>
      <Stack.Screen options={{ title: titulo }} />
      <Formulario referencia={rolagem}>
        {acao.duplicado ? (
          <Aviso tom="alerta" titulo="Possível item duplicado">
            <Text style={estilos.textoAviso}>
              Já existe “{acao.duplicado.nome}” deste fabricante em {acao.duplicado.localDescricao}.
            </Text>
            <View style={estilos.acoesAviso}>
              <Botao
                titulo="Ver item existente"
                variante="secundario"
                compacto
                onPress={() => router.push(`/item/${acao.duplicado.id}`)}
              />
              <Botao titulo="Salvar mesmo assim" compacto onPress={() => salvar(true)} />
            </View>
          </Aviso>
        ) : null}
        {acao.erro && !temErroDeCampo && !acao.duplicado ? <Aviso tom="perigo" texto={acao.erro} /> : null}
        {temErroDeCampo ? <Aviso tom="perigo" texto="Corrija os campos destacados." /> : null}

        <Seletor
          rotulo="Tipo de material"
          obrigatorio
          opcoes={TIPOS_ITEM}
          valor={form.tipo}
          onChange={(v) => alterar('tipo', v)}
          erro={erros.tipo}
        />
        <Campo
          rotulo="Nome do item / descrição"
          obrigatorio
          value={form.nome}
          onChangeText={(t) => alterar('nome', t)}
          erro={erros.nome}
          placeholder={reagente ? 'Ex.: Acetona PA 99,5%' : 'Ex.: Béquer 250 mL'}
        />
        <View style={estilos.linha}>
          <Campo
            rotulo={editando ? 'Quantidade disponível' : 'Quantidade'}
            obrigatorio
            value={form.quantidade}
            onChangeText={(t) => alterar('quantidade', t)}
            erro={erros.quantidade}
            keyboardType="decimal-pad"
            placeholder="Ex.: 3"
            estilo={{ flex: 1 }}
          />
          <Campo
            rotulo="Estoque mínimo"
            value={form.estoqueMinimo}
            onChangeText={(t) => alterar('estoqueMinimo', t)}
            erro={erros.estoqueMinimo}
            keyboardType="decimal-pad"
            placeholder="Opcional"
            estilo={{ flex: 1 }}
          />
        </View>
        <Seletor rotulo="Unidade" obrigatorio opcoes={UNIDADES} valor={form.unidade} onChange={(v) => alterar('unidade', v)} erro={erros.unidade} />
        <SeletorLocal
          rotulo="Local onde fica guardado"
          obrigatorio
          valor={form.localId}
          descricao={form.localDescricao}
          erro={erros.localId}
          onChange={(local) => {
            setForm((f) => ({ ...f, localId: local.id, localDescricao: local.descricao }));
            acao.limparCampo('localId');
          }}
          aoGerenciar={() => router.push('/locais')}
        />
        <CampoData
          rotulo="Data de validade"
          obrigatorio={reagente}
          valor={form.validade}
          onChange={(v) => alterar('validade', v)}
          erro={erros.validade}
          dica={reagente ? undefined : 'Opcional para vidraria e equipamentos.'}
        />
        <Campo rotulo="Fabricante" value={form.fabricante} onChangeText={(t) => alterar('fabricante', t)} placeholder="Ex.: Synth" />
        {reagente ? (
          <View style={estilos.linha}>
            <Campo
              rotulo="Concentração"
              value={form.concentracao}
              onChangeText={(t) => alterar('concentracao', t)}
              placeholder="Ex.: 0,1 M"
              estilo={{ flex: 1 }}
            />
            <Campo
              rotulo="Número CAS"
              value={form.cas}
              onChangeText={(t) => alterar('cas', t)}
              erro={erros.cas}
              placeholder="Ex.: 67-64-1"
              keyboardType="numbers-and-punctuation"
              autoCapitalize="none"
              estilo={{ flex: 1 }}
            />
          </View>
        ) : null}
        <Campo rotulo="Lote" value={form.lote} onChangeText={(t) => alterar('lote', t)} autoCapitalize="characters" />
        <Campo rotulo="Observações" value={form.observacoes} onChangeText={(t) => alterar('observacoes', t)} multilinha />

        <Botao
          titulo={editando ? 'Salvar alterações' : 'Salvar no inventário'}
          icone="save-outline"
          carregando={acao.executando}
          onPress={() => salvar(false)}
        />
        <Text style={estilos.legenda}>
          <Text style={{ color: cores.perigo }}>*</Text> Campos obrigatórios
        </Text>
      </Formulario>
    </>
  );
}

const estilos = StyleSheet.create({
  linha: { flexDirection: 'row', gap: espaco.md },
  textoAviso: { color: cores.alerta, fontSize: 14, lineHeight: 20 },
  acoesAviso: { flexDirection: 'row', flexWrap: 'wrap', gap: espaco.sm, marginTop: espaco.md },
  legenda: { fontSize: 13, color: cores.textoSecundario, marginTop: espaco.md, textAlign: 'center' },
});
