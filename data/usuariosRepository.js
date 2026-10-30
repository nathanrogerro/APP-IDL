import { getDb } from './db';
import { novoId } from './ids';
import { agoraISO } from '../utils/datas';

// Coleção `usuarios` (ADR-001). Senhas NUNCA são gravadas aqui (RNF10).

function mapear(linha) {
  if (!linha) return null;
  return {
    ...linha,
    ativo: !!linha.ativo,
    notificacoesAtivas: !!linha.notificacoesAtivas,
  };
}

export async function listar() {
  const db = await getDb();
  const linhas = await db.getAllAsync('SELECT * FROM usuarios ORDER BY nome COLLATE NOCASE');
  return linhas.map(mapear);
}

export async function buscarPorId(id) {
  const db = await getDb();
  return mapear(await db.getFirstAsync('SELECT * FROM usuarios WHERE id = ?', [id]));
}

export async function buscarPorEmail(email) {
  const db = await getDb();
  return mapear(await db.getFirstAsync('SELECT * FROM usuarios WHERE email = ?', [email.trim()]));
}

export async function criar(dados) {
  const db = await getDb();
  const agora = agoraISO();
  const usuario = {
    id: dados.id || novoId(),
    nome: dados.nome,
    email: dados.email.trim().toLowerCase(),
    perfil: dados.perfil,
    ativo: dados.ativo === false ? 0 : 1,
    diasAlertaValidade: dados.diasAlertaValidade ?? 30,
    notificacoesAtivas: dados.notificacoesAtivas ? 1 : 0,
    criadoEm: dados.criadoEm || agora,
    updatedAt: agora,
  };
  await db.runAsync(
    `INSERT INTO usuarios (id, nome, email, perfil, ativo, diasAlertaValidade, notificacoesAtivas, criadoEm, updatedAt)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      usuario.id,
      usuario.nome,
      usuario.email,
      usuario.perfil,
      usuario.ativo,
      usuario.diasAlertaValidade,
      usuario.notificacoesAtivas,
      usuario.criadoEm,
      usuario.updatedAt,
    ]
  );
  return mapear(usuario);
}

const CAMPOS_EDITAVEIS = ['nome', 'perfil', 'ativo', 'diasAlertaValidade', 'notificacoesAtivas'];

export async function atualizar(id, campos) {
  const db = await getDb();
  const nomes = Object.keys(campos).filter((c) => CAMPOS_EDITAVEIS.includes(c));
  if (!nomes.length) return;
  const valores = nomes.map((c) => (typeof campos[c] === 'boolean' ? (campos[c] ? 1 : 0) : campos[c]));
  await db.runAsync(
    `UPDATE usuarios SET ${nomes.map((c) => `${c} = ?`).join(', ')}, updatedAt = ? WHERE id = ?`,
    [...valores, agoraISO(), id]
  );
}
