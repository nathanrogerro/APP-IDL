import { useCallback, useRef, useState } from 'react';
import { ehErroDeValidacao, mensagemDoErro } from '../services/erros';

// Executa uma ação que grava dados (salvar, retirar, devolver...) e guarda o resultado
// para a tela exibir:
//   executando: mostra o indicador no botão
//   erro: mensagem geral
//   campos: mensagens por campo do formulário (ex.: { quantidade: 'Saldo insuficiente...' })
//   duplicado: item existente, quando o cadastro pode estar duplicado (RF13)
// `executar` devolve { ok: true, resultado } ou { ok: false, erro }.
export function useAcao(funcao) {
  const funcaoRef = useRef(funcao);
  funcaoRef.current = funcao;
  const [estado, setEstado] = useState({ executando: false, erro: null, campos: {}, duplicado: null });

  const executar = useCallback(async (...argumentos) => {
    setEstado({ executando: true, erro: null, campos: {}, duplicado: null });
    try {
      const resultado = await funcaoRef.current(...argumentos);
      setEstado({ executando: false, erro: null, campos: {}, duplicado: null });
      return { ok: true, resultado };
    } catch (erro) {
      if (!ehErroDeValidacao(erro)) console.warn(erro);
      const mensagem = mensagemDoErro(erro);
      setEstado({
        executando: false,
        erro: mensagem,
        campos: (erro && erro.campos) || {},
        duplicado: (erro && erro.duplicado) || null,
      });
      return { ok: false, erro: mensagem };
    }
  }, []);

  const limpar = useCallback(() => setEstado((e) => ({ ...e, erro: null, campos: {}, duplicado: null })), []);

  const limparCampo = useCallback(
    (campo) =>
      setEstado((e) => {
        if (!e.campos[campo]) return e;
        const campos = { ...e.campos };
        delete campos[campo];
        return { ...e, campos, erro: Object.keys(campos).length ? e.erro : null };
      }),
    []
  );

  return { ...estado, executar, limpar, limparCampo };
}
