import { useAuth } from '../context/AuthContext';
import * as usuariosService from '../services/usuariosService';
import { useAcao } from './useAcao';
import { useDados } from './useDados';

export function useUsuarios() {
  return useDados(() => usuariosService.listar(), []);
}

export function useAcoesDeUsuario() {
  const { usuario } = useAuth();
  const alterarPerfil = useAcao((id, perfil) => usuariosService.alterarPerfil(id, perfil, usuario));
  const alterarAtivo = useAcao((id, ativo) => usuariosService.alterarAtivo(id, ativo, usuario));
  return { alterarPerfil, alterarAtivo };
}

// Preferências do usuário logado (prazo do alerta de validade e notificação diária).
export function usePreferencias() {
  const { usuario, recarregarUsuario } = useAuth();
  return useAcao(async (preferencias) => {
    await usuariosService.salvarPreferencias(usuario.id, preferencias);
    return recarregarUsuario();
  });
}
