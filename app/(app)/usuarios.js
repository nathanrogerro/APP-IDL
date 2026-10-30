import { FlatList, StyleSheet, Switch, Text, View } from 'react-native';
import { router } from 'expo-router';
import { useAuth } from '../../context/AuthContext';
import { useAcoesDeUsuario, useUsuarios } from '../../hooks/useUsuarios';
import { EstadoLista } from '../../components/EstadoLista';
import { Seletor } from '../../components/Seletor';
import { Etiqueta } from '../../components/Etiqueta';
import { SemPermissao } from '../../components/Estrutura';
import { PERFIS, rotuloDe } from '../../constants/rotulos';
import { cores, espaco, fonte, raio } from '../../constants/tema';
import { mostrarToast } from '../../utils/toast';

// Usuários (RF05, US12): só o Administrador altera perfis e desativa contas (ADR-008).
export default function Usuarios() {
  const { usuario: eu, pode } = useAuth();
  const usuarios = useUsuarios();
  const { alterarPerfil, alterarAtivo } = useAcoesDeUsuario();

  if (!pode('gerenciarUsuarios')) return <SemPermissao aoVoltar={() => router.back()} />;

  async function trocarPerfil(alvo, perfil) {
    if (perfil === alvo.perfil) return;
    const r = await alterarPerfil.executar(alvo.id, perfil);
    mostrarToast(r.ok ? `${alvo.nome} agora é ${rotuloDe(PERFIS, perfil)}` : r.erro, r.ok ? 'sucesso' : 'erro');
    usuarios.recarregar();
  }

  async function trocarAtivo(alvo, ativo) {
    const r = await alterarAtivo.executar(alvo.id, ativo);
    mostrarToast(r.ok ? (ativo ? 'Conta reativada' : 'Conta desativada') : r.erro, r.ok ? 'sucesso' : 'erro');
    usuarios.recarregar();
  }

  return (
    <EstadoLista
      carregando={usuarios.carregando}
      erro={usuarios.erro}
      vazio={usuarios.vazio}
      onTentarNovamente={usuarios.recarregar}
      mensagemVazio="Nenhum usuário cadastrado"
      iconeVazio="people-outline"
    >
      <FlatList
        data={usuarios.dados}
        keyExtractor={(u) => u.id}
        contentContainerStyle={estilos.lista}
        ItemSeparatorComponent={() => <View style={{ height: espaco.md }} />}
        ListHeaderComponent={
          <Text style={estilos.ajuda}>
            Contas novas entram como Estudante. Promova a Técnico quem vai cadastrar itens. A mudança vale no próximo acesso.
          </Text>
        }
        renderItem={({ item: u }) => {
          const souEu = u.id === eu.id;
          return (
            <View style={[estilos.cartao, !u.ativo && estilos.inativo]}>
              <View style={estilos.topo}>
                <View style={{ flex: 1 }}>
                  <Text style={estilos.nome}>
                    {u.nome}
                    {souEu ? <Text style={estilos.voce}> (você)</Text> : null}
                  </Text>
                  <Text style={estilos.email}>{u.email}</Text>
                </View>
                {!u.ativo ? <Etiqueta tom="neutro" icone="ban-outline" texto="Desativada" /> : null}
              </View>
              {souEu ? (
                <View style={{ marginTop: espaco.md }}>
                  <Etiqueta tom="primaria" icone="shield-checkmark-outline" texto={rotuloDe(PERFIS, u.perfil)} />
                </View>
              ) : (
                <>
                  <Seletor opcoes={PERFIS} valor={u.perfil} onChange={(p) => trocarPerfil(u, p)} estilo={{ marginTop: espaco.md, marginBottom: espaco.sm }} />
                  <View style={estilos.linhaAtivo}>
                    <Text style={estilos.rotuloAtivo}>Conta ativa</Text>
                    <Switch
                      value={u.ativo}
                      onValueChange={(v) => trocarAtivo(u, v)}
                      trackColor={{ true: cores.primaria }}
                      accessibilityLabel={`Conta de ${u.nome} ativa`}
                    />
                  </View>
                </>
              )}
            </View>
          );
        }}
      />
    </EstadoLista>
  );
}

const estilos = StyleSheet.create({
  lista: { padding: espaco.lg, paddingBottom: espaco.xxl },
  ajuda: { fontSize: 14, color: cores.textoSecundario, marginBottom: espaco.lg, lineHeight: 20 },
  cartao: {
    backgroundColor: cores.superficie,
    borderRadius: raio.lg,
    borderWidth: 1,
    borderColor: cores.borda,
    padding: espaco.lg,
  },
  inativo: { backgroundColor: cores.superficieSuave },
  topo: { flexDirection: 'row', alignItems: 'flex-start', gap: espaco.sm },
  nome: { fontSize: fonte.normal + 1, fontWeight: '700', color: cores.texto },
  voce: { color: cores.textoSecundario, fontWeight: '600' },
  email: { fontSize: 14, color: cores.textoSecundario, marginTop: 2 },
  linhaAtivo: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', minHeight: 48 },
  rotuloAtivo: { fontSize: fonte.normal, color: cores.texto, fontWeight: '600' },
});
