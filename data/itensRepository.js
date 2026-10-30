import { getDb } from './db';
import { novoId } from './ids';
import { agoraISO } from '../utils/datas';
import { escaparLike } from '../utils/texto';

// Coleção `itens` (ADR-001).
// `quantidade` é o SALDO DISPONÍVEL (decisão 4 da ADR-001). A quantidade emprestada é
// calculada a partir dos empréstimos abertos, e o status (vencido, vencendo...) é calculado
// no serviço, nunca gravado (decisão 7).

const COLUNAS = `
  i.*,
  (SELECT COALESCE(SUM(e.quantidade), 0)
     FROM emprestimos e
    WHERE e.itemId = i.id AND e.dataDevolucao IS NULL) AS emprestado`;

function mapear(linha) {
  if (!linha) return null;
  return { ...linha, arquivado: !!linha.arquivado };
}

// Busca com filtros combináveis (RF22). Todos os filtros são opcionais.
//   termo: parte do nome, já normalizada (minúsculas, sem acento)
//   tipo, localId: filtros exatos
//   filtro: 'vencendo' | 'vencidos' | 'abaixo-minimo' (parâmetro vindo do Painel)
export async function listar({ termo, tipo, localId, filtro, hoje, limiteVencendo } = {}) {
  const db = await getDb();
  const condicoes = ['i.arquivado = 0'];
  const parametros = [];

  if (termo) {
    condicoes.push("i.nomeBusca LIKE ? ESCAPE '\\'");
    parametros.push(`%${escaparLike(termo)}%`);
  }
  if (tipo) {
    condicoes.push('i.tipo = ?');
    parametros.push(tipo);
  }
  if (localId) {
    condicoes.push('i.localId = ?');
    parametros.push(localId);
  }
  if (filtro === 'vencendo') {
    condicoes.push('i.validade IS NOT NULL AND i.validade >= ? AND i.validade <= ?');
    parametros.push(hoje, limiteVencendo);
  } else if (filtro === 'vencidos') {
    condicoes.push('i.validade IS NOT NULL AND i.validade < ?');
    parametros.push(hoje);
  } else if (filtro === 'abaixo-minimo') {
    condicoes.push('i.estoqueMinimo IS NOT NULL AND i.quantidade < i.estoqueMinimo');
  }

  const ordem = filtro === 'vencendo' || filtro === 'vencidos' ? 'i.validade ASC, i.nomeBusca ASC' : 'i.nomeBusca ASC';

  const linhas = await db.getAllAsync(
    `SELECT ${COLUNAS} FROM itens i WHERE ${condicoes.join(' AND ')} ORDER BY ${ordem}`,
    parametros
  );
  return linhas.map(mapear);
}

export async function buscarPorId(id) {
  const db = await getDb();
  return mapear(await db.getFirstAsync(`SELECT ${COLUNAS} FROM itens i WHERE i.id = ?`, [id]));
}

// Itens ativos com o mesmo nome (normalizado). A comparação do fabricante é feita no serviço.
export async function listarPorNomeBusca(nomeBusca) {
  const db = await getDb();
  const linhas = await db.getAllAsync('SELECT * FROM itens WHERE arquivado = 0 AND nomeBusca = ?', [nomeBusca]);
  return linhas.map(mapear);
}

export async function contarPorLocal(localId) {
  const db = await getDb();
  const linha = await db.getFirstAsync('SELECT COUNT(*) AS total FROM itens WHERE localId = ? AND arquivado = 0', [
    localId,
  ]);
  return linha ? linha.total : 0;
}

export async function criar(dados) {
  const db = await getDb();
  const agora = agoraISO();
  const item = {
    id: dados.id || novoId(),
    tipo: dados.tipo,
    nome: dados.nome,
    nomeBusca: dados.nomeBusca,
    concentracao: dados.concentracao ?? null,
    fabricante: dados.fabricante ?? null,
    lote: dados.lote ?? null,
    cas: dados.cas ?? null,
    observacoes: dados.observacoes ?? null,
    validade: dados.validade ?? null,
    quantidade: dados.quantidade,
    unidade: dados.unidade,
    estoqueMinimo: dados.estoqueMinimo ?? null,
    localId: dados.localId,
    localDescricao: dados.localDescricao,
    origem: dados.origem || 'manual',
    criadoPor: dados.criadoPor ?? null,
    criadoEm: dados.criadoEm || agora,
    updatedAt: agora,
  };
  await db.runAsync(
    `INSERT INTO itens (id, tipo, nome, nomeBusca, concentracao, fabricante, lote, cas, observacoes, validade,
                        quantidade, unidade, estoqueMinimo, localId, localDescricao, origem, arquivado,
                        criadoPor, criadoEm, updatedAt)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 0, ?, ?, ?)`,
    [
      item.id,
      item.tipo,
      item.nome,
      item.nomeBusca,
      item.concentracao,
      item.fabricante,
      item.lote,
      item.cas,
      item.observacoes,
      item.validade,
      item.quantidade,
      item.unidade,
      item.estoqueMinimo,
      item.localId,
      item.localDescricao,
      item.origem,
      item.criadoPor,
      item.criadoEm,
      item.updatedAt,
    ]
  );
  return { ...item, arquivado: false, emprestado: 0 };
}

const CAMPOS_EDITAVEIS = [
  'tipo',
  'nome',
  'nomeBusca',
  'concentracao',
  'fabricante',
  'lote',
  'cas',
  'observacoes',
  'validade',
  'quantidade',
  'unidade',
  'estoqueMinimo',
  'localId',
  'localDescricao',
];

export async function atualizar(id, campos) {
  const db = await getDb();
  const nomes = Object.keys(campos).filter((c) => CAMPOS_EDITAVEIS.includes(c));
  if (!nomes.length) return;
  await db.runAsync(
    `UPDATE itens SET ${nomes.map((c) => `${c} = ?`).join(', ')}, updatedAt = ? WHERE id = ?`,
    [...nomes.map((c) => campos[c]), agoraISO(), id]
  );
}

// Soma `delta` ao saldo (negativo na retirada/consumo, positivo na devolução).
// A condição no WHERE impede saldo negativo mesmo se duas operações acontecerem juntas:
// devolve false se a alteração não foi aplicada.
export async function ajustarQuantidade(id, delta) {
  const db = await getDb();
  const resultado = await db.runAsync(
    `UPDATE itens
        SET quantidade = ROUND(quantidade + ?, 3), updatedAt = ?
      WHERE id = ? AND arquivado = 0 AND ROUND(quantidade + ?, 3) >= 0`,
    [delta, agoraISO(), id, delta]
  );
  return resultado.changes === 1;
}

export async function arquivar(id) {
  const db = await getDb();
  await db.runAsync('UPDATE itens SET arquivado = 1, updatedAt = ? WHERE id = ?', [agoraISO(), id]);
}

// Mantém a cópia `localDescricao` (desnormalização da ADR-001) quando um local é renomeado.
export async function atualizarDescricaoDoLocal(localId, descricao) {
  const db = await getDb();
  await db.runAsync('UPDATE itens SET localDescricao = ?, updatedAt = ? WHERE localId = ?', [
    descricao,
    agoraISO(),
    localId,
  ]);
}

// Totais do Painel (RF24).
export async function resumo({ hoje, limiteVencendo }) {
  const db = await getDb();
  return db.getFirstAsync(
    `SELECT
       (SELECT COUNT(*) FROM itens WHERE arquivado = 0) AS totalItens,
       (SELECT COUNT(*) FROM itens WHERE arquivado = 0 AND validade IS NOT NULL
                                     AND validade >= ? AND validade <= ?) AS vencendo,
       (SELECT COUNT(*) FROM itens WHERE arquivado = 0 AND validade IS NOT NULL AND validade < ?) AS vencidos,
       (SELECT COUNT(*) FROM itens WHERE arquivado = 0 AND estoqueMinimo IS NOT NULL
                                     AND quantidade < estoqueMinimo) AS abaixoMinimo`,
    [hoje, limiteVencendo, hoje]
  );
}
