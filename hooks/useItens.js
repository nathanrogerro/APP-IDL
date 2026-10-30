import { useAuth } from '../context/AuthContext';
import * as itensService from '../services/itensService';
import { useAcao } from './useAcao';
import { useDados } from './useDados';

// Hooks dos itens do inventário. O prazo de alerta de vencimento vem das preferências
// do usuário logado (RF18).

function useDiasAlerta() {
  const { usuario } = useAuth();
  return usuario ? usuario.diasAlertaValidade : 30;
}

export function useItens({ busca = '', tipo = null, localId = null, filtro = null } = {}) {
  const diasAlerta = useDiasAlerta();
  return useDados(
    () => itensService.listar({ busca, tipo, localId, filtro, diasAlerta }),
    [busca, tipo, localId, filtro, diasAlerta]
  );
}

export function useItem(id) {
  const diasAlerta = useDiasAlerta();
  return useDados(() => itensService.obter(id, { diasAlerta }), [id, diasAlerta]);
}

// No formulário: com `id` carrega o item para edição; sem `id` (cadastro novo) devolve null.
export function useItemParaEdicao(id) {
  return useDados(() => (id ? itensService.obter(id) : Promise.resolve(null)), [id]);
}

export function useHistoricoDoItem(id) {
  return useDados(() => itensService.historico(id), [id]);
}

// Ações de cadastro, edição e exclusão.
export function useAcoesDoItem() {
  const { usuario } = useAuth();
  const criar = useAcao((form, opcoes) => itensService.criar(form, usuario, opcoes));
  const atualizar = useAcao((id, form, opcoes) => itensService.atualizar(id, form, usuario, opcoes));
  const excluir = useAcao((id) => itensService.excluir(id, usuario));
  return { criar, atualizar, excluir };
}

// Converte um item para os valores de texto do formulário de edição.
export const itemParaFormulario = itensService.paraFormulario;
