import { getDb } from './db';
import { novoId } from './ids';
import { agoraISO } from '../utils/datas';

// Coleção `emprestimos` (ADR-001). `dataDevolucao` nula = empréstimo aberto.

// Empréstimos abertos, atrasados primeiro.
//   usuarioId: só os de um usuário ("Meus")
//   somenteAtrasados: só os com data prevista anterior a `hoje`
export async function listarAbertos({ hoje, usuarioId, somenteAtrasados, itemId } = {}) {
  const db = await getDb();
  const condicoes = ['dataDevolucao IS NULL'];
  const parametros = [];
  if (usuarioId) {
    condicoes.push('usuarioId = ?');
    parametros.push(usuarioId);
  }
  if (itemId) {
    condicoes.push('itemId = ?');
    parametros.push(itemId);
  }
  if (somenteAtrasados) {
    condicoes.push('dataPrevista < ?');
    parametros.push(hoje);
  }
  return db.getAllAsync(
    `SELECT * FROM emprestimos
      WHERE ${condicoes.join(' AND ')}
      ORDER BY (dataPrevista < ?) DESC, dataPrevista ASC, dataRetirada ASC`,
    [...parametros, hoje]
  );
}

export async function buscarPorId(id) {
  const db = await getDb();
  return db.getFirstAsync('SELECT * FROM emprestimos WHERE id = ?', [id]);
}

export async function contarAbertosDoItem(itemId) {
  const db = await getDb();
  const linha = await db.getFirstAsync(
    'SELECT COUNT(*) AS total FROM emprestimos WHERE itemId = ? AND dataDevolucao IS NULL',
    [itemId]
  );
  return linha ? linha.total : 0;
}

export async function criar(dados) {
  const db = await getDb();
  const emprestimo = {
    id: dados.id || novoId(),
    itemId: dados.itemId,
    itemNome: dados.itemNome,
    usuarioId: dados.usuarioId,
    usuarioNome: dados.usuarioNome,
    quantidade: dados.quantidade,
    finalidade: dados.finalidade ?? null,
    dataRetirada: dados.dataRetirada,
    dataPrevista: dados.dataPrevista,
    dataDevolucao: dados.dataDevolucao ?? null,
    updatedAt: agoraISO(),
  };
  await db.runAsync(
    `INSERT INTO emprestimos (id, itemId, itemNome, usuarioId, usuarioNome, quantidade, finalidade,
                              dataRetirada, dataPrevista, dataDevolucao, updatedAt)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      emprestimo.id,
      emprestimo.itemId,
      emprestimo.itemNome,
      emprestimo.usuarioId,
      emprestimo.usuarioNome,
      emprestimo.quantidade,
      emprestimo.finalidade,
      emprestimo.dataRetirada,
      emprestimo.dataPrevista,
      emprestimo.dataDevolucao,
      emprestimo.updatedAt,
    ]
  );
  return emprestimo;
}

// Encerra o empréstimo. A condição no WHERE impede devolver duas vezes:
// devolve false se o empréstimo já estava encerrado.
export async function registrarDevolucao(id, dataDevolucao) {
  const db = await getDb();
  const resultado = await db.runAsync(
    'UPDATE emprestimos SET dataDevolucao = ?, updatedAt = ? WHERE id = ? AND dataDevolucao IS NULL',
    [dataDevolucao, agoraISO(), id]
  );
  return resultado.changes === 1;
}

// Totais do Painel (RF17, RF24).
export async function resumo({ hoje }) {
  const db = await getDb();
  return db.getFirstAsync(
    `SELECT
       (SELECT COUNT(*) FROM emprestimos WHERE dataDevolucao IS NULL) AS emprestimosAbertos,
       (SELECT COUNT(*) FROM emprestimos WHERE dataDevolucao IS NULL AND dataPrevista < ?) AS atrasados`,
    [hoje]
  );
}
