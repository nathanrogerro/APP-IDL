import { useCallback, useEffect, useRef, useState } from 'react';
import { useFocusEffect } from 'expo-router';
import { ehErroDeValidacao, mensagemDoErro } from '../services/erros';
import { erroSimuladoAtivo } from '../utils/simulacao';

// Carrega os dados de uma tela e controla os três estados exigidos pelo enunciado:
// carregando, vazio e erro (ADR-004, RNF29).
//
// - Carrega de novo quando `dependencias` mudam (ex.: texto da busca, filtros).
// - Carrega de novo quando a tela volta a ficar visível, por exemplo ao voltar da retirada
//   para o detalhe do item (ADR-005, "Atualização ao voltar"). Nesse caso os dados antigos
//   continuam na tela até os novos chegarem.
// - Se duas cargas se sobrepõem (busca digitada rápido), só a mais recente é aplicada.
export function useDados(carregar, dependencias = []) {
  const [estado, setEstado] = useState({ dados: null, carregando: true, atualizando: false, erro: null });
  const carregarRef = useRef(carregar);
  carregarRef.current = carregar;
  const ultimaCarga = useRef(0);
  const jaFocou = useRef(false);

  const executar = useCallback(async ({ puxando = false } = {}) => {
    const numero = ++ultimaCarga.current;
    setEstado((atual) => ({ ...atual, carregando: atual.dados === null, atualizando: puxando, erro: null }));
    try {
      if (erroSimuladoAtivo()) {
        await new Promise((resolve) => setTimeout(resolve, 400));
        const simulado = new Error('Falha simulada ao carregar os dados.');
        simulado.name = 'ErroSimulado';
        throw simulado;
      }
      const dados = await carregarRef.current();
      if (numero === ultimaCarga.current) {
        setEstado({ dados, carregando: false, atualizando: false, erro: null });
      }
    } catch (erro) {
      if (!ehErroDeValidacao(erro) && erro.name !== 'ErroSimulado') console.warn(erro);
      if (numero === ultimaCarga.current) {
        setEstado({
          dados: null,
          carregando: false,
          atualizando: false,
          erro: mensagemDoErro(erro, 'Não foi possível carregar os dados.'),
        });
      }
    }
  }, []);

  useEffect(() => {
    executar();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, dependencias);

  useFocusEffect(
    useCallback(() => {
      if (jaFocou.current) executar();
      jaFocou.current = true;
    }, [executar])
  );

  const { dados, carregando, atualizando, erro } = estado;
  return {
    dados,
    carregando,
    atualizando,
    erro,
    vazio: !carregando && !erro && Array.isArray(dados) && dados.length === 0,
    recarregar: executar,
    puxarParaAtualizar: () => executar({ puxando: true }),
  };
}
