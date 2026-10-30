import { getDb, salvar } from './db';

// Pares chave/valor guardados no aparelho.

export async function obter(chave) {
  const db = await getDb();
  return db.configuracoes[chave] ?? null;
}

export async function definir(chave, valor) {
  const db = await getDb();
  db.configuracoes[chave] = valor;
  await salvar();
}

export async function remover(chave) {
  const db = await getDb();
  delete db.configuracoes[chave];
  await salvar();
}
