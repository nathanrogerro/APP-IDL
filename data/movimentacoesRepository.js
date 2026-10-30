import { getDb } from './db';
import { novoId } from './ids';
import { agoraISO } from '../utils/datas';

// Coleção `movimentacoes` (ADR-001): somente inclusão. Não existe função de alterar
// nem de apagar, e o banco também recusa essas operações (RNF20).

export async function criar(dados) {
  const db = await getDb();
  const movimentacao = {
    id: dados.id || novoId(),
    itemId: dados.itemId,
    itemNome: dados.itemNome,
    tipo: dados.tipo,
    quantidade: dados.quantidade ?? null,
    usuarioId: dados.usuarioId ?? null,
    usuarioNome: dados.usuarioNome ?? null,
    observacao: dados.observacao ?? null,
    dataHora: dados.dataHora || agoraISO(),
  };
  await db.runAsync(
    `INSERT INTO movimentacoes (id, itemId, itemNome, tipo, quantidade, usuarioId, usuarioNome, observacao, dataHora)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      movimentacao.id,
      movimentacao.itemId,
      movimentacao.itemNome,
      movimentacao.tipo,
      movimentacao.quantidade,
      movimentacao.usuarioId,
      movimentacao.usuarioNome,
      movimentacao.observacao,
      movimentacao.dataHora,
    ]
  );
  return movimentacao;
}

// Histórico de um item, do mais recente para o mais antigo (RF23, US09).
export async function listarPorItem(itemId) {
  const db = await getDb();
  return db.getAllAsync('SELECT * FROM movimentacoes WHERE itemId = ? ORDER BY dataHora DESC', [itemId]);
}

// Últimas movimentações de todos os itens (Painel, RF24).
export async function listarRecentes(limite = 8) {
  const db = await getDb();
  return db.getAllAsync('SELECT * FROM movimentacoes ORDER BY dataHora DESC LIMIT ?', [limite]);
}
