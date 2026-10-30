import { useState } from 'react';
import { Text } from 'react-native';
import { useAcao } from '../../hooks/useAcao';
import { solicitarRecuperacao } from '../../hooks/useRecuperacaoDeSenha';
import { Campo } from '../../components/Campo';
import { Botao } from '../../components/Botao';
import { Aviso } from '../../components/Aviso';
import { Formulario } from '../../components/Estrutura';
import { cores, espaco } from '../../constants/tema';

// RF03. Nesta versão a tela valida o e-mail; o envio do link fica com o Firebase Authentication.
export default function RecuperarSenha() {
  const acao = useAcao(solicitarRecuperacao);
  const [email, setEmail] = useState('');
  const [enviado, setEnviado] = useState(false);

  async function enviar() {
    const r = await acao.executar(email);
    setEnviado(r.ok);
  }

  return (
    <Formulario>
      <Text style={{ color: cores.textoSecundario, fontSize: 15, marginBottom: espaco.lg }}>
        Informe o e-mail da sua conta para receber o link de redefinição de senha.
      </Text>
      {enviado ? (
        <Aviso tom="info" texto="O envio do e-mail de redefinição ainda não está disponível nesta versão do app." />
      ) : null}
      <Campo
        rotulo="E-mail"
        obrigatorio
        value={email}
        onChangeText={(t) => {
          setEmail(t);
          setEnviado(false);
          acao.limparCampo('email');
        }}
        erro={acao.campos.email}
        keyboardType="email-address"
        autoCapitalize="none"
        autoCorrect={false}
        autoComplete="email"
      />
      <Botao titulo="Enviar link" icone="mail-outline" onPress={enviar} carregando={acao.executando} />
    </Formulario>
  );
}
