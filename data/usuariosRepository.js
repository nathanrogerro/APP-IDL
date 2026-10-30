import { getDb, salvar } from './db';
import { novoId } from './ids';
import { agoraISO } from '../utils/datas';
import { compararTexto } from '../utils/texto';

// Coleção `usuarios` (ADR-001). Senhas NUNCA são gravadas aqui (RNF10).

// Os repositórios devolvem cópias: alterar o objeto recebido não altera o banco.
function copiar(usuario) {
  return usuario ? { ...usuario } : null;
}

function mesmoEmail(a, b) {
  return a.trim().toLowerCase() === b.trim().toLowerCase();
}

export async function listar() {
  const db = await getDb();
  return db.usuarios.map(copiar).sort((a, b) => compararTexto(a.nome, b.nome));
}

export async function buscarPorId(id) {
  const db = await getDb();
  return copiar(db.usuarios.find((u) => u.id === id));
}

export async function buscarPorEmail(email) {
  const db = await getDb();
  return copiar(db.usuarios.find((u) => mesmoEmail(u.email, email)));
}

export async function criar(dados) {
  const db = await getDb();
  if (db.usuarios.some((u) => mesmoEmail(u.email, dados.email))) {
    throw new Error('Já existe um usuário com este e-mail.');
  }
  const agora = agoraISO();
  const usuario = {
    id: dados.id || novoId(),
    nome: dados.nome,
    email: dados.email.trim().toLowerCase(),
    perfil: dados.perfil,
    ativo: dados.ativo !== false,
    diasAlertaValidade: dados.diasAlertaValidade ?? 30,
    notificacoesAtivas: !!dados.notificacoesAtivas,
    criadoEm: dados.criadoEm || agora,
    updatedAt: agora,
  };
  db.usuarios.push(usuario);
  await salvar();
  return copiar(usuario);
}

const CAMPOS_EDITAVEIS = ['nome', 'perfil', 'ativo', 'diasAlertaValidade', 'notificacoesAtivas'];

export async function atualizar(id, campos) {
  const db = await getDb();
  const nomes = Object.keys(campos).filter((c) => CAMPOS_EDITAVEIS.includes(c));
  const usuario = db.usuarios.find((u) => u.id === id);
  if (!nomes.length || !usuario) return;
  for (const c of nomes) usuario[c] = campos[c];
  usuario.updatedAt = agoraISO();
  await salvar();
}
