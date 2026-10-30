import { getDb } from './db';

// Pares chave/valor guardados no aparelho.

export async function obter(chave) {
  const db = await getDb();
  const linha = await db.getFirstAsync('SELECT valor FROM configuracoes WHERE chave = ?', [chave]);
  return linha ? linha.valor : null;
}

export async function definir(chave, valor) {
  const db = await getDb();
  await db.runAsync(
    'INSERT INTO configuracoes (chave, valor) VALUES (?, ?) ON CONFLICT (chave) DO UPDATE SET valor = excluded.valor',
    [chave, valor]
  );
}

export async function remover(chave) {
  const db = await getDb();
  await db.runAsync('DELETE FROM configuracoes WHERE chave = ?', [chave]);
}
