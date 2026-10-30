import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../context/AuthContext';
import { useAcao } from '../../hooks/useAcao';
import { Campo } from '../../components/Campo';
import { Botao } from '../../components/Botao';
import { Aviso } from '../../components/Aviso';
import { Formulario } from '../../components/Estrutura';
import { emailValido, regrasDaSenha } from '../../utils/validacao';
import { cores, espaco } from '../../constants/tema';

const REGRAS = [
  { chave: 'tamanho', texto: 'Pelo menos 8 caracteres' },
  { chave: 'letra', texto: 'Pelo menos 1 letra' },
  { chave: 'numero', texto: 'Pelo menos 1 número' },
];

// RF02 / US02. O formulário não tem campo de perfil: toda conta nova é Estudante (ADR-008).
export default function Cadastro() {
  const { cadastrar } = useAuth();
  const acao = useAcao(cadastrar);
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');

  const regras = regrasDaSenha(senha);
  const senhaOk = regras.tamanho && regras.letra && regras.numero;
  const podeEnviar = nome.trim().length >= 3 && emailValido(email) && senhaOk;
  const temErroDeCampo = Object.keys(acao.campos).length > 0;

  return (
    <Formulario>
      <Aviso
        tom="info"
        texto="Contas novas entram com o perfil Estudante. O responsável pelo laboratório pode alterar o perfil depois."
      />
      {acao.erro && !temErroDeCampo ? <Aviso tom="perigo" texto={acao.erro} /> : null}
      <Campo
        rotulo="Nome completo"
        obrigatorio
        value={nome}
        onChangeText={(t) => {
          setNome(t);
          acao.limparCampo('nome');
        }}
        erro={acao.campos.nome}
        autoComplete="name"
        textContentType="name"
      />
      <Campo
        rotulo="E-mail"
        obrigatorio
        value={email}
        onChangeText={(t) => {
          setEmail(t);
          acao.limparCampo('email');
        }}
        erro={acao.campos.email}
        keyboardType="email-address"
        autoCapitalize="none"
        autoCorrect={false}
        autoComplete="email"
        textContentType="emailAddress"
      />
      <Campo
        rotulo="Senha"
        obrigatorio
        value={senha}
        onChangeText={(t) => {
          setSenha(t);
          acao.limparCampo('senha');
        }}
        erro={acao.campos.senha}
        secureTextEntry
        autoCapitalize="none"
        autoComplete="new-password"
        textContentType="newPassword"
      >
        <View style={estilos.regras} accessibilityLabel="Regras da senha">
          {REGRAS.map((r) => (
            <View key={r.chave} style={estilos.regra}>
              <Ionicons
                name={regras[r.chave] ? 'checkmark-circle' : 'ellipse-outline'}
                size={16}
                color={regras[r.chave] ? cores.sucesso : cores.textoSuave}
              />
              <Text style={[estilos.textoRegra, regras[r.chave] && { color: cores.sucesso }]}>{r.texto}</Text>
            </View>
          ))}
        </View>
      </Campo>
      <Botao
        titulo="Criar conta"
        icone="person-add-outline"
        onPress={() => acao.executar({ nome, email, senha })}
        carregando={acao.executando}
        desabilitado={!podeEnviar}
      />
    </Formulario>
  );
}

const estilos = StyleSheet.create({
  regras: { marginTop: espaco.sm, gap: 4 },
  regra: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  textoRegra: { fontSize: 13, color: cores.textoSecundario },
});
