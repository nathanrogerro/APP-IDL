import { getDb, salvar } from './db';
import { novoId } from './ids';
import { agoraISO } from '../utils/datas';

// Coleção `emprestimos` (ADR-001). `dataDevolucao` nula = empréstimo aberto.

function copiar(emprestimo) {
  return emprestimo ? { ...emprestimo } : null;
}

function compararCampo(a, b) {
  if (a < b) return -1;
  if (a > b) return 1;
  return 0;
}

// Empréstimos abertos, atrasados primeiro.
//   usuarioId: só os de um usuário ("Meus")
//   somenteAtrasados: só os com data prevista anterior a `hoje`
export async function listarAbertos({ hoje, usuarioId, somenteAtrasados, itemId } = {}) {
  const db = await getDb();
  const atrasado = (e) => e.dataPrevista < hoje;
  return db.emprestimos
    .filter(
      (e) =>
        !e.dataDevolucao &&
        (!usuarioId || e.usuarioId === usuarioId) &&
        (!itemId || e.itemId === itemId) &&
        (!somenteAtrasados || atrasado(e))
    )
    .sort(
      (a, b) =>
        Number(atrasado(b)) - Number(atrasado(a)) ||
        compararCampo(a.dataPrevista, b.dataPrevista) ||
        compararCampo(a.dataRetirada, b.dataRetirada)
    )
    .map(copiar);
}

export async function buscarPorId(id) {
  const db = await getDb();
  return copiar(db.emprestimos.find((e) => e.id === id));
}

export async function contarAbertosDoItem(itemId) {
  const db = await getDb();
  return db.emprestimos.filter((e) => e.itemId === itemId && !e.dataDevolucao).length;
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
  db.emprestimos.push(emprestimo);
  await salvar();
  return copiar(emprestimo);
}

// Encerra o empréstimo. Impede devolver duas vezes:
// devolve false se o empréstimo já estava encerrado.
export async function registrarDevolucao(id, dataDevolucao) {
  const db = await getDb();
  const emprestimo = db.emprestimos.find((e) => e.id === id && !e.dataDevolucao);
  if (!emprestimo) return false;
  emprestimo.dataDevolucao = dataDevolucao;
  emprestimo.updatedAt = agoraISO();
  await salvar();
  return true;
}

// Totais do Painel (RF17, RF24).
export async function resumo({ hoje }) {
  const db = await getDb();
  const abertos = db.emprestimos.filter((e) => !e.dataDevolucao);
  return {
    emprestimosAbertos: abertos.length,
    atrasados: abertos.filter((e) => e.dataPrevista < hoje).length,
  };
}
