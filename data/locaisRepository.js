import { getDb, salvar } from './db';
import { novoId } from './ids';
import { agoraISO } from '../utils/datas';
import { compararTexto } from '../utils/texto';

// Coleção `locais` (ADR-001): sala → armário → prateleira. Exclusão lógica (`arquivado`).

function copiar(local) {
  return local ? { ...local } : null;
}

// Lista os locais ativos, com a quantidade de itens ativos em cada um.
export async function listar() {
  const db = await getDb();
  return db.locais
    .filter((l) => !l.arquivado)
    .map((l) => ({
      ...l,
      totalItens: db.itens.filter((i) => i.localId === l.id && !i.arquivado).length,
    }))
    .sort((a, b) => compararTexto(a.descricao, b.descricao));
}

export async function buscarPorId(id) {
  const db = await getDb();
  return copiar(db.locais.find((l) => l.id === id));
}

export async function buscarPorDescricao(descricao) {
  const db = await getDb();
  const procurada = descricao.toLowerCase();
  return copiar(db.locais.find((l) => !l.arquivado && l.descricao.toLowerCase() === procurada));
}

export async function criar(dados) {
  const db = await getDb();
  const local = {
    id: dados.id || novoId(),
    sala: dados.sala,
    armario: dados.armario ?? null,
    prateleira: dados.prateleira ?? null,
    descricao: dados.descricao,
    arquivado: false,
    updatedAt: agoraISO(),
  };
  db.locais.push(local);
  await salvar();
  return copiar(local);
}

export async function atualizar(id, dados) {
  const db = await getDb();
  const local = db.locais.find((l) => l.id === id);
  if (!local) return;
  local.sala = dados.sala;
  local.armario = dados.armario ?? null;
  local.prateleira = dados.prateleira ?? null;
  local.descricao = dados.descricao;
  local.updatedAt = agoraISO();
  await salvar();
}

export async function arquivar(id) {
  const db = await getDb();
  const local = db.locais.find((l) => l.id === id);
  if (!local) return;
  local.arquivado = true;
  local.updatedAt = agoraISO();
  await salvar();
}
