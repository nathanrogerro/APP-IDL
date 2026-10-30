import { useAuth } from '../context/AuthContext';
import * as emprestimosService from '../services/emprestimosService';
import { useAcao } from './useAcao';
import { useDados } from './useDados';

// filtro: 'abertos' | 'atrasados' | 'meus'
export function useEmprestimos(filtro = 'abertos') {
  const { usuario } = useAuth();
  const usuarioId = usuario ? usuario.id : null;
  return useDados(() => emprestimosService.listar({ filtro, usuarioId }), [filtro, usuarioId]);
}

export function useEmprestimosDoItem(itemId) {
  return useDados(() => emprestimosService.listarDoItem(itemId), [itemId]);
}

export function useAcoesDeEmprestimo() {
  const { usuario } = useAuth();
  const retirar = useAcao((dados) => emprestimosService.registrarRetirada({ ...dados, usuario }));
  const consumir = useAcao((dados) => emprestimosService.registrarConsumo({ ...dados, usuario }));
  const devolver = useAcao((emprestimoId) => emprestimosService.registrarDevolucao(emprestimoId, usuario));
  return { retirar, consumir, devolver };
}
