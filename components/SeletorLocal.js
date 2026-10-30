import { useState } from 'react';
import { FlatList, Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { EstadoLista } from './EstadoLista';
import { estilosDeCampo } from './Campo';
import { useLocais } from '../hooks/useLocais';
import { cores, espaco, fonte, raio, TOQUE_MINIMO } from '../constants/tema';

// Campo que abre a lista de locais cadastrados (RF12) para escolher um.
//   permitirTodos: inclui a opção "Todos os locais" (filtro do Inventário)
//   aoGerenciar: mostra o link "Gerenciar locais"
export function SeletorLocal({
  valor,
  descricao,
  onChange,
  rotulo,
  obrigatorio = false,
  erro,
  permitirTodos = false,
  aoGerenciar,
  placeholder = 'Escolher local',
  compacto = false,
}) {
  const [aberto, setAberto] = useState(false);
  const texto = descricao || (permitirTodos && !valor ? 'Todos os locais' : placeholder);

  return (
    <View style={!compacto && estilos.campo}>
      {rotulo ? (
        <Text style={estilosDeCampo.rotulo}>
          {rotulo}
          {obrigatorio ? <Text style={estilosDeCampo.obrigatorio}> *</Text> : null}
        </Text>
      ) : null}
      <Pressable
        onPress={() => setAberto(true)}
        accessibilityRole="button"
        accessibilityLabel={`${rotulo || 'Local'}: ${texto}`}
        style={[estilos.botao, compacto && estilos.botaoCompacto, erro && estilos.botaoComErro]}
      >
        <Ionicons name="location-outline" size={18} color={cores.textoSecundario} />
        <Text style={[estilos.texto, !descricao && !permitirTodos && estilos.placeholder]} numberOfLines={1}>
          {texto}
        </Text>
        <Ionicons name="chevron-down" size={18} color={cores.textoSecundario} />
      </Pressable>
      {erro ? <Text style={estilosDeCampo.erro}>{erro}</Text> : null}
      {aberto ? (
        <ListaDeLocais
          valor={valor}
          permitirTodos={permitirTodos}
          aoFechar={() => setAberto(false)}
          aoEscolher={(local) => {
            setAberto(false);
            onChange(local);
          }}
          aoGerenciar={
            aoGerenciar
              ? () => {
                  setAberto(false);
                  aoGerenciar();
                }
              : null
          }
        />
      ) : null}
    </View>
  );
}

function ListaDeLocais({ valor, permitirTodos, aoFechar, aoEscolher, aoGerenciar }) {
  const locais = useLocais();
  const insets = useSafeAreaInsets();
  const opcoes = permitirTodos && locais.dados ? [{ id: null, descricao: 'Todos os locais' }, ...locais.dados] : locais.dados;

  return (
    <Modal visible transparent animationType="slide" onRequestClose={aoFechar}>
      <Pressable style={estilos.fundo} onPress={aoFechar} accessibilityLabel="Fechar" />
      <View style={[estilos.painel, { paddingBottom: insets.bottom + espaco.md }]}>
        <View style={estilos.cabecalho}>
          <Text style={estilos.tituloPainel}>Escolher local</Text>
          <Pressable onPress={aoFechar} hitSlop={12} accessibilityRole="button" accessibilityLabel="Fechar">
            <Ionicons name="close" size={24} color={cores.texto} />
          </Pressable>
        </View>
        <EstadoLista
          carregando={locais.carregando}
          erro={locais.erro}
          vazio={locais.vazio}
          onTentarNovamente={locais.recarregar}
          mensagemVazio="Nenhum local cadastrado"
          iconeVazio="location-outline"
          compacto
        >
          <FlatList
            data={opcoes}
            keyExtractor={(l) => String(l.id)}
            style={estilos.lista}
            renderItem={({ item: local }) => {
              const ativo = local.id === valor || (!valor && local.id === null);
              return (
                <Pressable
                  onPress={() => aoEscolher(local)}
                  accessibilityRole="radio"
                  accessibilityState={{ selected: ativo }}
                  style={({ pressed }) => [estilos.opcao, pressed && { backgroundColor: cores.superficieSuave }]}
                >
                  <Text style={[estilos.textoOpcao, ativo && estilos.textoAtivo]}>{local.descricao}</Text>
                  {ativo ? <Ionicons name="checkmark" size={20} color={cores.primaria} /> : null}
                </Pressable>
              );
            }}
          />
        </EstadoLista>
        {aoGerenciar ? (
          <Pressable onPress={aoGerenciar} style={estilos.gerenciar} accessibilityRole="link">
            <Ionicons name="settings-outline" size={18} color={cores.primaria} />
            <Text style={estilos.textoGerenciar}>Gerenciar locais</Text>
          </Pressable>
        ) : null}
      </View>
    </Modal>
  );
}

const estilos = StyleSheet.create({
  campo: { marginBottom: espaco.lg },
  botao: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: espaco.sm,
    minHeight: TOQUE_MINIMO,
    borderWidth: 1,
    borderColor: cores.bordaForte,
    borderRadius: raio.md,
    backgroundColor: cores.superficie,
    paddingHorizontal: espaco.md,
  },
  botaoCompacto: { minHeight: 40, borderRadius: raio.pilula },
  botaoComErro: { borderColor: cores.perigo, borderWidth: 1.5 },
  texto: { flex: 1, fontSize: fonte.normal, color: cores.texto },
  placeholder: { color: cores.textoSuave },
  fundo: { flex: 1, backgroundColor: 'rgba(15, 23, 42, 0.45)' },
  painel: {
    maxHeight: '75%',
    backgroundColor: cores.superficie,
    borderTopLeftRadius: raio.lg + 4,
    borderTopRightRadius: raio.lg + 4,
    paddingTop: espaco.md,
  },
  cabecalho: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: espaco.lg,
    paddingBottom: espaco.sm,
  },
  tituloPainel: { fontSize: fonte.media, fontWeight: '700', color: cores.texto },
  lista: { flexGrow: 0 },
  opcao: {
    minHeight: TOQUE_MINIMO + 4,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: espaco.lg,
    borderBottomWidth: 1,
    borderBottomColor: cores.borda,
    gap: espaco.sm,
  },
  textoOpcao: { flex: 1, fontSize: fonte.normal, color: cores.texto },
  textoAtivo: { fontWeight: '700', color: cores.primariaEscura },
  gerenciar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: espaco.sm,
    minHeight: TOQUE_MINIMO,
    paddingHorizontal: espaco.lg,
  },
  textoGerenciar: { color: cores.primaria, fontWeight: '700', fontSize: fonte.normal },
});
