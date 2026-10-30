import { getDb } from './db';
import { novoId } from './ids';
import { agoraISO } from '../utils/datas';

// Coleção `locais` (ADR-001): sala → armário → prateleira. Exclusão lógica (`arquivado`).

function mapear(linha) {
  if (!linha) return null;
  return { ...linha, arquivado: !!linha.arquivado };
}

// Lista os locais ativos, com a quantidade de itens ativos em cada um.
export async function listar() {
  const db = await getDb();
  const linhas = await db.getAllAsync(
    `SELECT l.*,
            (SELECT COUNT(*) FROM itens i WHERE i.localId = l.id AND i.arquivado = 0) AS totalItens
       FROM locais l
      WHERE l.arquivado = 0
      ORDER BY l.descricao COLLATE NOCASE`
  );
  return linhas.map(mapear);
}

export async function buscarPorId(id) {
  const db = await getDb();
  return mapear(await db.getFirstAsync('SELECT * FROM locais WHERE id = ?', [id]));
}

export async function buscarPorDescricao(descricao) {
  const db = await getDb();
  return mapear(
    await db.getFirstAsync('SELECT * FROM locais WHERE arquivado = 0 AND descricao = ? COLLATE NOCASE', [descricao])
  );
}

export async function criar(dados) {
  const db = await getDb();
  const local = {
    id: dados.id || novoId(),
    sala: dados.sala,
    armario: dados.armario ?? null,
    prateleira: dados.prateleira ?? null,
    descricao: dados.descricao,
    updatedAt: agoraISO(),
  };
  await db.runAsync(
    'INSERT INTO locais (id, sala, armario, prateleira, descricao, arquivado, updatedAt) VALUES (?, ?, ?, ?, ?, 0, ?)',
    [local.id, local.sala, local.armario, local.prateleira, local.descricao, local.updatedAt]
  );
  return { ...local, arquivado: false };
}

export async function atualizar(id, dados) {
  const db = await getDb();
  await db.runAsync(
    'UPDATE locais SET sala = ?, armario = ?, prateleira = ?, descricao = ?, updatedAt = ? WHERE id = ?',
    [dados.sala, dados.armario ?? null, dados.prateleira ?? null, dados.descricao, agoraISO(), id]
  );
}

export async function arquivar(id) {
  const db = await getDb();
  await db.runAsync('UPDATE locais SET arquivado = 1, updatedAt = ? WHERE id = ?', [agoraISO(), id]);
}
