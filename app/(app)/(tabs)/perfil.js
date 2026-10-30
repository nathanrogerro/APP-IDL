import { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, Switch, Text, View } from 'react-native';
import { router } from 'expo-router';
import { useAuth } from '../../../context/AuthContext';
import { usePreferencias } from '../../../hooks/useUsuarios';
import { useFerramentasDeDemonstracao } from '../../../hooks/useBanco';
import { Campo } from '../../../components/Campo';
import { Chip } from '../../../components/Seletor';
import { Botao } from '../../../components/Botao';
import { Etiqueta } from '../../../components/Etiqueta';
import { Cartao, ItemDeMenu, Secao } from '../../../components/Estrutura';
import { PERFIS, rotuloDe } from '../../../constants/rotulos';
import { cores, espaco, fonte } from '../../../constants/tema';
import { confirmar } from '../../../utils/confirmar';
import { mostrarToast } from '../../../utils/toast';

const ATALHOS_DE_DIAS = [15, 30, 60, 90];

function iniciais(nome) {
  const partes = nome.trim().split(/\s+/);
  return ((partes[0] || '')[0] + ((partes.length > 1 ? partes[partes.length - 1] : '')[0] || '')).toUpperCase();
}

// Perfil e configurações: prazo do alerta de validade (RF18, RNF21), notificação diária (RF20),
// acesso a Locais e Usuários, ferramentas de demonstração e logout (RF06).
export default function Perfil() {
  const { usuario, sair, pode } = useAuth();
  const preferencias = usePreferencias();
  const demo = useFerramentasDeDemonstracao();
  const [dias, setDias] = useState(String(usuario.diasAlertaValidade));

  useEffect(() => {
    setDias(String(usuario.diasAlertaValidade));
  }, [usuario.diasAlertaValidade]);

  async function salvarPrazo() {
    const r = await preferencias.executar({ diasAlertaValidade: dias });
    if (r.ok) mostrarToast('Prazo do alerta atualizado');
  }

  async function alternarNotificacoes(ativo) {
    const r = await preferencias.executar({ notificacoesAtivas: ativo });
    if (r.ok) mostrarToast(ativo ? 'Notificação diária ativada' : 'Notificação diária desativada');
  }

  async function restaurar() {
    const ok = await confirmar({
      titulo: 'Restaurar dados de exemplo',
      mensagem: 'Todos os itens, locais, empréstimos e o histórico voltarão ao estado inicial. Continuar?',
      textoConfirmar: 'Restaurar',
      destrutivo: true,
    });
    if (!ok) return;
    const r = await demo.restaurar.executar();
    mostrarToast(r.ok ? 'Dados de exemplo restaurados' : 'Não foi possível restaurar os dados.', r.ok ? 'sucesso' : 'erro');
  }

  const prazoAlterado = dias !== String(usuario.diasAlertaValidade);

  return (
    <ScrollView contentContainerStyle={estilos.conteudo} keyboardShouldPersistTaps="handled" automaticallyAdjustKeyboardInsets>
      <Cartao estilo={estilos.usuario}>
        <View style={estilos.avatar}>
          <Text style={estilos.textoAvatar}>{iniciais(usuario.nome)}</Text>
        </View>
        <View style={{ flex: 1 }}>
          <Text style={estilos.nome}>{usuario.nome}</Text>
          <Text style={estilos.email}>{usuario.email}</Text>
          <View style={{ marginTop: espaco.sm }}>
            <Etiqueta tom="primaria" icone="shield-checkmark-outline" texto={rotuloDe(PERFIS, usuario.perfil)} />
          </View>
        </View>
      </Cartao>

      <Secao titulo="Alertas de validade" estilo={{ marginTop: espaco.xl }}>
        <Cartao>
          <Campo
            rotulo="Avisar com antecedência de (dias)"
            value={dias}
            onChangeText={(t) => {
              setDias(t.replace(/\D/g, ''));
              preferencias.limparCampo('diasAlertaValidade');
            }}
            keyboardType="number-pad"
            maxLength={3}
            erro={preferencias.campos.diasAlertaValidade}
            dica="Entre 7 e 180 dias. O padrão é 30."
          >
            <View style={estilos.atalhos}>
              {ATALHOS_DE_DIAS.map((d) => (
                <Chip key={d} rotulo={`${d} dias`} ativo={dias === String(d)} onPress={() => setDias(String(d))} />
              ))}
            </View>
          </Campo>
          <Botao
            titulo="Salvar prazo"
            icone="save-outline"
            compacto
            desabilitado={!prazoAlterado}
            carregando={preferencias.executando && prazoAlterado}
            onPress={salvarPrazo}
            estilo={{ alignSelf: 'flex-start' }}
          />
          <View style={estilos.separador} />
          <ItemDeMenu
            icone="notifications-outline"
            titulo="Notificação diária"
            descricao="Resumo de itens vencendo e devoluções atrasadas"
            ultimo
            direita={
              <Switch
                value={usuario.notificacoesAtivas}
                onValueChange={alternarNotificacoes}
                disabled={preferencias.executando}
                trackColor={{ true: cores.primaria }}
                accessibilityLabel="Notificação diária"
              />
            }
          />
        </Cartao>
      </Secao>

      <Secao titulo="Laboratório">
        <Cartao estilo={estilos.menu}>
          <ItemDeMenu
            icone="location-outline"
            titulo="Locais"
            descricao="Salas, armários e prateleiras"
            onPress={() => router.push('/locais')}
            ultimo={!pode('gerenciarUsuarios')}
          />
          {pode('gerenciarUsuarios') ? (
            <ItemDeMenu
              icone="people-outline"
              titulo="Usuários"
              descricao="Alterar perfis e desativar contas"
              onPress={() => router.push('/usuarios')}
              ultimo
            />
          ) : null}
        </Cartao>
      </Secao>

      {__DEV__ ? (
        <Secao titulo="Demonstração">
          <Cartao estilo={estilos.menu}>
            <ItemDeMenu
              icone="bug-outline"
              titulo="Simular erro nas listagens"
              descricao="Mostra o estado de erro com “Tentar novamente”"
              direita={
                <Switch
                  value={demo.erroSimulado}
                  onValueChange={demo.alternarErroSimulado}
                  trackColor={{ true: cores.primaria }}
                  accessibilityLabel="Simular erro nas listagens"
                />
              }
            />
            <ItemDeMenu
              icone="refresh-outline"
              titulo="Restaurar dados de exemplo"
              descricao={demo.restaurar.executando ? 'Restaurando...' : 'Volta itens, locais e empréstimos ao estado inicial'}
              onPress={demo.restaurar.executando ? undefined : restaurar}
              ultimo
            />
          </Cartao>
        </Secao>
      ) : null}

      <Botao titulo="Sair" icone="log-out-outline" variante="perigo" onPress={sair} />
    </ScrollView>
  );
}

const estilos = StyleSheet.create({
  conteudo: { padding: espaco.lg, paddingBottom: espaco.xxl },
  usuario: { flexDirection: 'row', alignItems: 'center', gap: espaco.lg },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: cores.cabecalho,
    alignItems: 'center',
    justifyContent: 'center',
  },
  textoAvatar: { color: cores.destaque, fontSize: fonte.grande, fontWeight: '800' },
  nome: { fontSize: fonte.media, fontWeight: '800', color: cores.texto },
  email: { fontSize: 14, color: cores.textoSecundario, marginTop: 2 },
  atalhos: { flexDirection: 'row', flexWrap: 'wrap', gap: espaco.sm, marginTop: espaco.sm },
  separador: { height: 1, backgroundColor: cores.borda, marginTop: espaco.lg },
  menu: { paddingVertical: espaco.xs },
});
