import { useAuth } from '../context/AuthContext';
import * as painelService from '../services/painelService';
import { useDados } from './useDados';

export function usePainel() {
  const { usuario } = useAuth();
  const diasAlerta = usuario ? usuario.diasAlertaValidade : 30;
  return useDados(() => painelService.obter({ diasAlerta }), [diasAlerta]);
}
