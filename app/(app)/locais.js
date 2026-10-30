import { useState } from 'react';
import { FlatList, KeyboardAvoidingView, Modal, Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../context/AuthContext';
import { useAcoesDeLocal, useLocais } from '../../hooks/useLocais';
import { EstadoLista } from '../../components/EstadoLista';
import { Campo } from '../../components/Campo';
import { Botao } from '../../components/Botao';
import { Aviso } from '../../components/Aviso';
import { cores, espaco, fonte, raio, sombra, TOQUE_MINIMO } from '../../constants/tema';
import { descreverLocal } from '../../utils/texto';
import { confirmar } from '../../utils/confirmar';
import { mostrarToast } from '../../utils/toast';

// Locais de armazenamento (RF12): sala → armário → prateleira.
// Todos os perfis veem a lista; só Administrador e Técnico cadastram, editam e excluem.
export default function Locais() {
  const { pode } = useAuth();
  const podeEditar = pode('editarLocais');
  const locais = useLocais();
  const acoes = useAcoesDeLocal();
  const [edicao, setEdicao] = useState(null); // null = fechado; { id?, sala, armario, prateleira }

  async function excluirLocal(local) {
    const ok = await confirmar({
      titulo: 'Excluir local',
      mensagem: `Excluir "${local.descricao}"?`,
      textoConfirmar: 'Excluir',
      destrutivo: true,
    });
    if (!ok) return;
    const r = await acoes.excluir.executar(local.id);
    if (r.ok) {
      mostrarToast('Local excluído');
      locais.recarregar();
    } else {
      mostrarToast(r.erro, 'erro');
    }
  }

  return (
    <View style={estilos.tela}>
      <EstadoLista
        carregando={locais.carregando}
        erro={locais.erro}
        vazio={locais.vazio}
        onTentarNovamente={locais.recarregar}
        mensagemVazio="Nenhum local cadastrado"
        iconeVazio="location-outline"
        acaoVazio={podeEditar ? { titulo: 'Cadastrar local', icone: 'add', onPress: () => setEdicao({ sala: '', armario: '', prateleira: '' }) } : undefined}
      >
        <FlatList
          data={locais.dados}
          keyExtractor={(l) => l.id}
          contentContainerStyle={estilos.lista}
          ItemSeparatorComponent={() => <View style={{ height: espaco.sm }} />}
          ListHeaderComponent={
            podeEditar ? (
              <Botao
                titulo="Novo local"
                icone="add"
                variante="secundario"
                compacto
                estilo={{ alignSelf: 'flex-start', marginBottom: espaco.md }}
                onPress={() => setEdicao({ sala: '', armario: '', prateleira: '' })}
              />
            ) : null
          }
          renderItem={({ item: local }) => (
            <View style={estilos.linha}>
              <Ionicons name="location-outline" size={22} color={cores.primaria} />
              <View style={{ flex: 1 }}>
                <Text style={estilos.descricao}>{local.descricao}</Text>
                <Text style={estilos.contagem}>
                  {local.totalItens === 0 ? 'Vazio' : `${local.totalItens} ${local.totalItens === 1 ? 'item' : 'itens'}`}
                </Text>
              </View>
              {podeEditar ? (
                <>
                  <Pressable
                    onPress={() => setEdicao({ id: local.id, sala: local.sala || '', armario: local.armario || '', prateleira: local.prateleira || '' })}
                    style={estilos.icone}
                    accessibilityRole="button"
                    accessibilityLabel={`Editar ${local.descricao}`}
                  >
                    <Ionicons name="create-outline" size={22} color={cores.textoSecundario} />
                  </Pressable>
                  <Pressable
                    onPress={() => excluirLocal(local)}
                    style={estilos.icone}
                    accessibilityRole="button"
                    accessibilityLabel={`Excluir ${local.descricao}`}
                  >
                    <Ionicons name="trash-outline" size={22} color={cores.perigo} />
                  </Pressable>
                </>
              ) : null}
            </View>
          )}
        />
      </EstadoLista>

      {edicao ? (
        <FormularioDeLocal
          inicial={edicao}
          acao={edicao.id ? acoes.atualizar : acoes.criar}
          aoSalvar={async (form) => {
            const r = edicao.id ? await acoes.atualizar.executar(edicao.id, form) : await acoes.criar.executar(form);
            if (r.ok) {
              mostrarToast(edicao.id ? 'Local atualizado' : 'Local cadastrado');
              setEdicao(null);
              locais.recarregar();
            }
          }}
          aoFechar={() => {
            acoes.criar.limpar();
            acoes.atualizar.limpar();
            setEdicao(null);
          }}
        />
      ) : null}
    </View>
  );
}

function FormularioDeLocal({ inicial, acao, aoSalvar, aoFechar }) {
  const [form, setForm] = useState(inicial);
  const previa = descreverLocal(form);
  const alterar = (campo, valor) => {
    setForm((f) => ({ ...f, [campo]: valor }));
    acao.limparCampo(campo);
  };
  const temErroDeCampo = Object.keys(acao.campos).length > 0;

  return (
    <Modal visible transparent animationType="fade" onRequestClose={aoFechar}>
      <KeyboardAvoidingView style={estilos.fundo} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <View style={estilos.dialogo}>
          <View style={estilos.cabecalhoDialogo}>
            <Text style={estilos.titulo}>{inicial.id ? 'Editar local' : 'Novo local'}</Text>
            <Pressable onPress={aoFechar} hitSlop={12} accessibilityRole="button" accessibilityLabel="Fechar">
              <Ionicons name="close" size={24} color={cores.texto} />
            </Pressable>
          </View>
          {acao.erro && !temErroDeCampo ? <Aviso tom="perigo" texto={acao.erro} /> : null}
          <Campo rotulo="Sala" obrigatorio value={form.sala} onChangeText={(t) => alterar('sala', t)} erro={acao.campos.sala} placeholder="Ex.: Sala 2" />
          <Campo rotulo="Armário" value={form.armario} onChangeText={(t) => alterar('armario', t)} erro={acao.campos.armario} placeholder="Ex.: Armário de Inflamáveis" />
          <Campo rotulo="Prateleira" value={form.prateleira} onChangeText={(t) => alterar('prateleira', t)} placeholder="Ex.: Prateleira B" />
          {previa ? <Text style={estilos.previa}>Ficará assim: {previa}</Text> : null}
          <Botao titulo="Salvar local" icone="save-outline" carregando={acao.executando} onPress={() => aoSalvar(form)} />
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const estilos = StyleSheet.create({
  tela: { flex: 1, backgroundColor: cores.fundo },
  lista: { padding: espaco.lg, paddingBottom: espaco.xxl },
  linha: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: espaco.md,
    backgroundColor: cores.superficie,
    borderRadius: raio.lg,
    borderWidth: 1,
    borderColor: cores.borda,
    paddingLeft: espaco.md,
    paddingVertical: espaco.sm,
    minHeight: 64,
  },
  descricao: { fontSize: fonte.normal, fontWeight: '700', color: cores.texto },
  contagem: { fontSize: 13, color: cores.textoSecundario, marginTop: 2 },
  icone: { width: TOQUE_MINIMO, height: TOQUE_MINIMO, alignItems: 'center', justifyContent: 'center' },
  fundo: { flex: 1, backgroundColor: 'rgba(15, 23, 42, 0.45)', justifyContent: 'center', padding: espaco.lg },
  dialogo: { backgroundColor: cores.superficie, borderRadius: raio.lg + 4, padding: espaco.xl, ...sombra },
  cabecalhoDialogo: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: espaco.lg },
  titulo: { fontSize: fonte.grande, fontWeight: '800', color: cores.texto },
  previa: { fontSize: 14, color: cores.textoSecundario, marginBottom: espaco.lg, marginTop: -espaco.sm },
});
