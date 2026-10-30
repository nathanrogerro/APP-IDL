import * as usuariosRepo from '../data/usuariosRepository';
import * as configuracoesRepo from '../data/configuracoesRepository';
import { emailValido, senhaValida } from '../utils/validacao';
import { erroDeValidacao, lancarSeHouverErros } from './erros';

// Sessão do usuário.
//
// Fase local: o enunciado exclui a autenticação desta etapa. O login localiza a conta pelo
// e-mail e aceita qualquer senha preenchida (README, "Usuários de exemplo"). Na Entrega 3,
// estas funções passam a chamar o Firebase Authentication; as telas não mudam (ADR-005).
//
// Senhas nunca são gravadas no aparelho (RNF10).

const CHAVE_SESSAO = 'sessaoUsuarioId';

export async function entrar(email, senha) {
  const campos = {};
  if (!emailValido(email)) campos.email = 'Informe um e-mail válido.';
  if (!senha) campos.senha = 'Informe a senha.';
  lancarSeHouverErros(campos);

  const usuario = await usuariosRepo.buscarPorEmail(email);
  // Mesma mensagem para e-mail ou senha errados, sem dizer qual dos dois (US01).
  if (!usuario) throw erroDeValidacao('E-mail ou senha inválidos.');
  if (!usuario.ativo) throw erroDeValidacao('Conta desativada. Procure o responsável pelo laboratório.');

  await configuracoesRepo.definir(CHAVE_SESSAO, usuario.id);
  return usuario;
}

export async function cadastrar({ nome, email, senha }) {
  const campos = {};
  if (!nome || nome.trim().length < 3) campos.nome = 'Informe seu nome completo.';
  if (!emailValido(email)) campos.email = 'Informe um e-mail válido.';
  if (!senhaValida(senha)) campos.senha = 'A senha precisa ter 8 caracteres, com pelo menos 1 letra e 1 número.';
  lancarSeHouverErros(campos);

  if (await usuariosRepo.buscarPorEmail(email)) {
    throw erroDeValidacao('E-mail já em uso.', { email: 'E-mail já em uso.' });
  }

  // Toda conta nova é Estudante; só um Administrador muda o perfil (ADR-008).
  const usuario = await usuariosRepo.criar({ nome: nome.trim(), email, perfil: 'estudante' });
  await configuracoesRepo.definir(CHAVE_SESSAO, usuario.id);
  return usuario;
}

// Usuário com sessão aberta neste aparelho, ou null. Contas desativadas perdem a sessão.
export async function usuarioDaSessao() {
  const id = await configuracoesRepo.obter(CHAVE_SESSAO);
  if (!id) return null;
  const usuario = await usuariosRepo.buscarPorId(id);
  if (!usuario || !usuario.ativo) {
    await configuracoesRepo.remover(CHAVE_SESSAO);
    return null;
  }
  return usuario;
}

export async function sair() {
  await configuracoesRepo.remover(CHAVE_SESSAO);
}

// Fase local: só valida o e-mail. O envio do link (RF03) é feito pelo Firebase na Entrega 3.
export async function solicitarRecuperacaoDeSenha(email) {
  if (!emailValido(email)) {
    throw erroDeValidacao('Informe um e-mail válido.', { email: 'Informe um e-mail válido.' });
  }
}
