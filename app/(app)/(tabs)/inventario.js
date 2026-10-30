import { useState } from 'react';
import { FlatList, Pressable, RefreshControl, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../../context/AuthContext';
import { useItens } from '../../../hooks/useItens';
import { useAtraso } from '../../../hooks/useAtraso';
import { EstadoLista } from '../../../components/EstadoLista';
import { CartaoItem } from '../../../components/CartaoItem';
import { Chip } from '../../../components/Seletor';
import { SeletorLocal } from '../../../components/SeletorLocal';
import { MenuDeAcoes } from '../../../components/MenuDeAcoes';
import { BotaoFlutuante } from '../../../components/Estrutura';
import { FILTROS_INVENTARIO, TIPOS_ITEM } from '../../../constants/rotulos';
import { cores, espaco, fonte, raio, TOQUE_MINIMO } from '../../../constants/tema';

// Inventário (RF22, US08): busca por parte do nome, filtros combináveis de tipo e local,
// e o filtro recebido do Painel pelo parâmetro de rota `filtro`.
export default function Inventario() {
  const params = useLocalSearchParams();
  const filtro = typeof params.filtro === 'string' && FILTROS_INVENTARIO[params.filtro] ? params.filtro : null;

  const { pode } = useAuth();
  const [busca, setBusca] = useState('');
  const buscaAtrasada = useAtraso(busca.trim(), 300);
  const [tipo, setTipo] = useState(null);
  const [local, setLocal] = useState(null);
  const [menuAberto, setMenuAberto] = useState(false);

  const itens = useItens({ busca: buscaAtrasada, tipo, localId: local ? local.id : null, filtro });
  const temFiltro = !!(buscaAtrasada || tipo || local || filtro);
  const podeCadastrar = pode('editarItens');
  const total = itens.dados ? itens.dados.length : 0;

  return (
    <View style={estilos.tela}>
      <View style={estilos.filtros}>
        <View style={estilos.busca}>
          <Ionicons name="search" size={20} color={cores.textoSecundario} />
          <TextInput
            value={busca}
            onChangeText={setBusca}
            placeholder="Buscar por nome (ex.: etanol)"
            placeholderTextColor={cores.textoSuave}
            style={estilos.entradaBusca}
            returnKeyType="search"
            autoCorrect={false}
            accessibilityLabel="Buscar itens pelo nome"
          />
          {busca ? (
            <Pressable onPress={() => setBusca('')} hitSlop={12} accessibilityRole="button" accessibilityLabel="Limpar busca">
              <Ionicons name="close-circle" size={20} color={cores.textoSuave} />
            </Pressable>
          ) : null}
        </View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={estilos.linhaChips}>
          <Chip rotulo="Todos" ativo={!tipo} papel="radio" onPress={() => setTipo(null)} />
          {TIPOS_ITEM.map((t) => (
            <Chip key={t.valor} rotulo={t.rotulo} icone={t.icone} ativo={tipo === t.valor} papel="radio" onPress={() => setTipo(t.valor)} />
          ))}
        </ScrollView>
        <View style={estilos.linhaLocal}>
          <View style={{ flex: 1 }}>
            <SeletorLocal
              compacto
              permitirTodos
              valor={local ? local.id : null}
              descricao={local ? local.descricao : null}
              onChange={(l) => setLocal(l.id ? l : null)}
            />
          </View>
          {filtro ? (
            <Chip rotulo={FILTROS_INVENTARIO[filtro]} ativo aoRemover={() => router.setParams({ filtro: '' })} />
          ) : null}
        </View>
      </View>

      <EstadoLista
        carregando={itens.carregando}
        erro={itens.erro}
        vazio={itens.vazio}
        onTentarNovamente={itens.recarregar}
        mensagemVazio={temFiltro ? 'Nenhum item encontrado' : 'Nenhum item cadastrado'}
        descricaoVazio={temFiltro ? 'Confira o nome digitado ou remova algum filtro.' : 'Cadastre o primeiro item do laboratório.'}
        iconeVazio="search-outline"
        acaoVazio={podeCadastrar ? { titulo: 'Cadastrar item', icone: 'add', onPress: () => router.push('/item/form') } : undefined}
      >
        <FlatList
          data={itens.dados}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => <CartaoItem item={item} onPress={() => router.push(`/item/${item.id}`)} />}
          ItemSeparatorComponent={Separador}
          ListHeaderComponent={
            <Text style={estilos.contagem}>
              {total} {total === 1 ? 'item' : 'itens'}
            </Text>
          }
          contentContainerStyle={estilos.lista}
          keyboardShouldPersistTaps="handled"
          refreshControl={<RefreshControl refreshing={itens.atualizando} onRefresh={itens.puxarParaAtualizar} />}
        />
      </EstadoLista>

      {podeCadastrar ? <BotaoFlutuante rotulo="Cadastrar item" onPress={() => setMenuAberto(true)} /> : null}
      <MenuDeAcoes
        visivel={menuAberto}
        titulo="Cadastrar item"
        aoFechar={() => setMenuAberto(false)}
        opcoes={[
          { titulo: 'Cadastro manual', descricao: 'Preencher o formulário', icone: 'create-outline', onPress: () => router.push('/item/form') },
          { titulo: 'Cadastro por foto', descricao: 'Fotografar o rótulo do reagente', icone: 'camera-outline', onPress: () => router.push('/item/foto') },
        ]}
      />
    </View>
  );
}

function Separador() {
  return <View style={{ height: espaco.md }} />;
}

const estilos = StyleSheet.create({
  tela: { flex: 1, backgroundColor: cores.fundo },
  filtros: {
    backgroundColor: cores.superficie,
    paddingHorizontal: espaco.lg,
    paddingTop: espaco.md,
    paddingBottom: espaco.sm,
    borderBottomWidth: 1,
    borderBottomColor: cores.borda,
    gap: espaco.sm,
  },
  busca: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: espaco.sm,
    minHeight: TOQUE_MINIMO,
    borderRadius: raio.md,
    backgroundColor: cores.superficieSuave,
    paddingHorizontal: espaco.md,
  },
  entradaBusca: { flex: 1, fontSize: fonte.normal, color: cores.texto, minHeight: TOQUE_MINIMO },
  linhaChips: { gap: espaco.sm, paddingVertical: 2 },
  linhaLocal: { flexDirection: 'row', alignItems: 'center', gap: espaco.sm },
  lista: { padding: espaco.lg, paddingBottom: 96 },
  contagem: { fontSize: 13, color: cores.textoSecundario, fontWeight: '600', marginBottom: espaco.sm },
});
