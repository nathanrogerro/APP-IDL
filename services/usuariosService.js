import * as usuariosRepo from '../data/usuariosRepository';
import { lerNumero } from '../utils/texto';
import { erroDeValidacao } from './erros';

// Gestão de usuários pelo Administrador (RF05, US12) e preferências de cada usuário (RF18, RF20).

const PERFIS = ['admin', 'tecnico', 'estudante'];

export async function listar() {
  return usuariosRepo.listar();
}

export async function alterarPerfil(usuarioId, perfil, usuarioAtual) {
  if (usuarioId === usuarioAtual.id) {
    throw erroDeValidacao('Você não pode alterar o seu próprio perfil.');
  }
  if (!PERFIS.includes(perfil)) throw erroDeValidacao('Perfil inválido.');
  await usuariosRepo.atualizar(usuarioId, { perfil });
}

export async function alterarAtivo(usuarioId, ativo, usuarioAtual) {
  if (usuarioId === usuarioAtual.id) {
    throw erroDeValidacao('Você não pode desativar a sua própria conta.');
  }
  await usuariosRepo.atualizar(usuarioId, { ativo: !!ativo });
}

// Prazo do alerta de vencimento: padrão 30 dias, entre 7 e 180 (RNF21).
export async function salvarPreferencias(usuarioId, { diasAlertaValidade, notificacoesAtivas }) {
  const campos = {};
  if (diasAlertaValidade !== undefined) {
    const dias = typeof diasAlertaValidade === 'number' ? diasAlertaValidade : lerNumero(diasAlertaValidade);
    if (!Number.isInteger(dias) || dias < 7 || dias > 180) {
      const mensagem = 'Escolha um prazo entre 7 e 180 dias.';
      throw erroDeValidacao(mensagem, { diasAlertaValidade: mensagem });
    }
    campos.diasAlertaValidade = dias;
  }
  if (notificacoesAtivas !== undefined) campos.notificacoesAtivas = !!notificacoesAtivas;
  await usuariosRepo.atualizar(usuarioId, campos);
  return usuariosRepo.buscarPorId(usuarioId);
}
