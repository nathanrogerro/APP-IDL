import * as SQLite from 'expo-sqlite';

// Abertura do banco local (SQLite) e criação das tabelas.
// As tabelas seguem as coleções da ADR-001. A versão do esquema fica em
// PRAGMA user_version (ADR-002): cada alteração futura vira um novo passo em `migrar`,
// sem apagar os dados que já estão no aparelho.

const NOME_DO_BANCO = 'labsto.db';

const ESQUEMA_V1 = `
CREATE TABLE IF NOT EXISTS usuarios (
  id TEXT PRIMARY KEY NOT NULL,
  nome TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE COLLATE NOCASE,
  perfil TEXT NOT NULL CHECK (perfil IN ('admin', 'tecnico', 'estudante')),
  ativo INTEGER NOT NULL DEFAULT 1,
  diasAlertaValidade INTEGER NOT NULL DEFAULT 30,
  notificacoesAtivas INTEGER NOT NULL DEFAULT 0,
  criadoEm TEXT NOT NULL,
  updatedAt TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS locais (
  id TEXT PRIMARY KEY NOT NULL,
  sala TEXT NOT NULL,
  armario TEXT,
  prateleira TEXT,
  descricao TEXT NOT NULL,
  arquivado INTEGER NOT NULL DEFAULT 0,
  updatedAt TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS itens (
  id TEXT PRIMARY KEY NOT NULL,
  tipo TEXT NOT NULL CHECK (tipo IN ('reagente', 'vidraria', 'equipamento')),
  nome TEXT NOT NULL,
  nomeBusca TEXT NOT NULL,
  concentracao TEXT,
  fabricante TEXT,
  lote TEXT,
  cas TEXT,
  observacoes TEXT,
  validade TEXT,
  quantidade REAL NOT NULL DEFAULT 0 CHECK (quantidade >= 0),
  unidade TEXT NOT NULL,
  estoqueMinimo REAL,
  localId TEXT NOT NULL REFERENCES locais (id),
  localDescricao TEXT NOT NULL,
  origem TEXT NOT NULL DEFAULT 'manual',
  arquivado INTEGER NOT NULL DEFAULT 0,
  criadoPor TEXT,
  criadoEm TEXT NOT NULL,
  updatedAt TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS emprestimos (
  id TEXT PRIMARY KEY NOT NULL,
  itemId TEXT NOT NULL REFERENCES itens (id),
  itemNome TEXT NOT NULL,
  usuarioId TEXT NOT NULL,
  usuarioNome TEXT NOT NULL,
  quantidade REAL NOT NULL CHECK (quantidade > 0),
  finalidade TEXT,
  dataRetirada TEXT NOT NULL,
  dataPrevista TEXT NOT NULL,
  dataDevolucao TEXT,
  updatedAt TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS movimentacoes (
  id TEXT PRIMARY KEY NOT NULL,
  itemId TEXT NOT NULL,
  itemNome TEXT NOT NULL,
  tipo TEXT NOT NULL CHECK (tipo IN ('cadastro', 'edicao', 'retirada', 'devolucao', 'consumo', 'exclusao')),
  quantidade REAL,
  usuarioId TEXT,
  usuarioNome TEXT,
  observacao TEXT,
  dataHora TEXT NOT NULL
);

-- O histórico é imutável (RNF20): o próprio banco recusa alterar ou apagar movimentações.
CREATE TRIGGER IF NOT EXISTS movimentacoes_sem_alteracao
BEFORE UPDATE ON movimentacoes
BEGIN
  SELECT RAISE(ABORT, 'O histórico de movimentações não pode ser alterado.');
END;

CREATE TRIGGER IF NOT EXISTS movimentacoes_sem_exclusao
BEFORE DELETE ON movimentacoes
BEGIN
  SELECT RAISE(ABORT, 'O histórico de movimentações não pode ser apagado.');
END;

-- Configurações do aparelho (ex.: usuário com sessão aberta).
CREATE TABLE IF NOT EXISTS configuracoes (
  chave TEXT PRIMARY KEY NOT NULL,
  valor TEXT
);

CREATE INDEX IF NOT EXISTS idx_itens_busca ON itens (arquivado, nomeBusca);
CREATE INDEX IF NOT EXISTS idx_itens_validade ON itens (arquivado, validade);
CREATE INDEX IF NOT EXISTS idx_itens_local ON itens (localId);
CREATE INDEX IF NOT EXISTS idx_emprestimos_abertos ON emprestimos (dataDevolucao, dataPrevista);
CREATE INDEX IF NOT EXISTS idx_emprestimos_item ON emprestimos (itemId);
CREATE INDEX IF NOT EXISTS idx_movimentacoes_item ON movimentacoes (itemId, dataHora);
CREATE INDEX IF NOT EXISTS idx_movimentacoes_data ON movimentacoes (dataHora);
`;

let conexao = null;

// Devolve sempre a mesma conexão. Se a abertura falhar, a próxima chamada tenta de novo.
export function getDb() {
  if (!conexao) {
    conexao = abrir().catch((erro) => {
      conexao = null;
      throw erro;
    });
  }
  return conexao;
}

async function abrir() {
  const db = await SQLite.openDatabaseAsync(NOME_DO_BANCO);
  await db.execAsync('PRAGMA foreign_keys = ON;');
  await migrar(db);
  return db;
}

async function migrar(db) {
  const linha = await db.getFirstAsync('PRAGMA user_version');
  const versao = linha ? linha.user_version : 0;

  if (versao < 1) {
    await db.execAsync(ESQUEMA_V1);
    await db.execAsync('PRAGMA user_version = 1');
  }
  // Exemplo de alteração futura:
  // if (versao < 2) {
  //   await db.execAsync('ALTER TABLE itens ADD COLUMN ...');
  //   await db.execAsync('PRAGMA user_version = 2');
  // }
}

// Executa várias gravações como uma só: ou todas são salvas, ou nenhuma (US05).
export async function emTransacao(tarefa) {
  const db = await getDb();
  let resultado;
  await db.withTransactionAsync(async () => {
    resultado = await tarefa();
  });
  return resultado;
}

// Apaga e recria as tabelas de dados (usado por "Restaurar dados de exemplo").
// A tabela de configurações é mantida, para não derrubar a sessão aberta.
export async function recriarTabelas() {
  const db = await getDb();
  await db.execAsync(`
    DROP TABLE IF EXISTS movimentacoes;
    DROP TABLE IF EXISTS emprestimos;
    DROP TABLE IF EXISTS itens;
    DROP TABLE IF EXISTS locais;
    DROP TABLE IF EXISTS usuarios;
    PRAGMA user_version = 0;
  `);
  await migrar(db);
}
