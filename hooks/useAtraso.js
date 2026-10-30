import { useEffect, useState } from 'react';

// Devolve `valor` só depois que ele parar de mudar por `ms` milissegundos.
// Usado na busca, para não consultar o banco a cada letra digitada.
export function useAtraso(valor, ms = 300) {
  const [atrasado, setAtrasado] = useState(valor);
  useEffect(() => {
    const t = setTimeout(() => setAtrasado(valor), ms);
    return () => clearTimeout(t);
  }, [valor, ms]);
  return atrasado;
}
