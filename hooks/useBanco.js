import { useCallback, useEffect, useState } from 'react';
import * as bancoService from '../services/bancoService';
import { useAuth } from '../context/AuthContext';
import { useAcao } from './useAcao';
import { definirErroSimulado, erroSimuladoAtivo } from '../utils/simulacao';

// Prepara o banco local antes de mostrar qualquer tela (usado no layout raiz).
export function usePrepararBanco() {
  const [estado, setEstado] = useState({ pronto: false, erro: null });

  const preparar = useCallback(async () => {
    setEstado({ pronto: false, erro: null });
    try {
      await bancoService.preparar();
      setEstado({ pronto: true, erro: null });
    } catch (erro) {
      console.warn(erro);
      setEstado({ pronto: false, erro: 'Não foi possível abrir o banco de dados do aparelho.' });
    }
  }, []);

  useEffect(() => {
    preparar();
  }, [preparar]);

  return { ...estado, tentarNovamente: preparar };
}

// Ferramentas de demonstração da tela Perfil.
export function useFerramentasDeDemonstracao() {
  const { recarregarUsuario } = useAuth();
  const [erroSimulado, setErroSimulado] = useState(erroSimuladoAtivo());

  const restaurar = useAcao(async () => {
    await bancoService.restaurarExemplos();
    // Se a conta logada não existir mais nos dados de exemplo, a sessão é encerrada.
    await recarregarUsuario();
  });

  const alternarErroSimulado = useCallback((ativo) => {
    definirErroSimulado(ativo);
    setErroSimulado(ativo);
  }, []);

  return { restaurar, erroSimulado, alternarErroSimulado };
}
