import { getDb, salvar } from './db';
import { novoId } from './ids';
import { agoraISO } from '../utils/datas';

// Coleção `movimentacoes` (ADR-001): somente inclusão. Não existe função de alterar
// nem de apagar, e cada registro fica congelado depois de gravado (RNF20).

// Do mais recente para o mais antigo; no mesmo instante, o último registrado vem primeiro.
function maisRecentesPrimeiro(lista) {
  return lista
    .map((m, posicao) => ({ m, posicao }))
    .sort((a, b) => {
      if (a.m.dataHora !== b.m.dataHora) return a.m.dataHora < b.m.dataHora ? 1 : -1;
      return b.posicao - a.posicao;
    })
    .map(({ m }) => ({ ...m }));
}

export async function criar(dados) {
  const db = await getDb();
  const movimentacao = Object.freeze({
    id: dados.id || novoId(),
    itemId: dados.itemId,
    itemNome: dados.itemNome,
    tipo: dados.tipo,
    quantidade: dados.quantidade ?? null,
    usuarioId: dados.usuarioId ?? null,
    usuarioNome: dados.usuarioNome ?? null,
    observacao: dados.observacao ?? null,
    dataHora: dados.dataHora || agoraISO(),
  });
  db.movimentacoes.push(movimentacao);
  await salvar();
  return { ...movimentacao };
}

// Histórico de um item, do mais recente para o mais antigo (RF23, US09).
export async function listarPorItem(itemId) {
  const db = await getDb();
  return maisRecentesPrimeiro(db.movimentacoes.filter((m) => m.itemId === itemId));
}

// Últimas movimentações de todos os itens (Painel, RF24).
export async function listarRecentes(limite = 8) {
  const db = await getDb();
  return maisRecentesPrimeiro(db.movimentacoes).slice(0, limite);
}
