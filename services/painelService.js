import * as itensRepo from '../data/itensRepository';
import * as emprestimosRepo from '../data/emprestimosRepository';
import * as movimentacoesRepo from '../data/movimentacoesRepository';
import { hojeISO, somarDias } from '../utils/datas';

// Painel (RF24): totais e movimentações recentes.
export async function obter({ diasAlerta = 30 } = {}) {
  const hoje = hojeISO();
  const totaisItens = await itensRepo.resumo({ hoje, limiteVencendo: somarDias(hoje, diasAlerta) });
  const totaisEmprestimos = await emprestimosRepo.resumo({ hoje });
  const recentes = await movimentacoesRepo.listarRecentes(8);
  return { totais: { ...totaisItens, ...totaisEmprestimos }, recentes, diasAlerta };
}
