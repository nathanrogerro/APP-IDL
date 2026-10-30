import * as locaisService from '../services/locaisService';
import { useAcao } from './useAcao';
import { useDados } from './useDados';

export function useLocais() {
  return useDados(() => locaisService.listar(), []);
}

export function useAcoesDeLocal() {
  const criar = useAcao((form) => locaisService.criar(form));
  const atualizar = useAcao((id, form) => locaisService.atualizar(id, form));
  const excluir = useAcao((id) => locaisService.excluir(id));
  return { criar, atualizar, excluir };
}
