import { getDb, salvar } from './db';
import { novoId } from './ids';
import { agoraISO } from '../utils/datas';

// Coleção `itens` (ADR-001).
// `quantidade` é o SALDO DISPONÍVEL (decisão 4 da ADR-001). A quantidade emprestada é
// calculada a partir dos empréstimos abertos, e o status (vencido, vencendo...) é calculado
// no serviço, nunca gravado (decisão 7).

function arredondar(valor) {
  return Math.round(valor * 1000) / 1000;
}

// Soma das quantidades em empréstimos abertos, por item.
function emprestadoPorItem(db) {
  const totais = new Map();
  for (const e of db.emprestimos) {
    if (!e.dataDevolucao) totais.set(e.itemId, (totais.get(e.itemId) || 0) + e.quantidade);
  }
  return totais;
}

function comEmprestado(item, totais) {
  return { ...item, emprestado: arredondar(totais.get(item.id) || 0) };
}

function vencendo(item, hoje, limiteVencendo) {
  return !!item.validade && item.validade >= hoje && item.validade <= limiteVencendo;
}

function vencido(item, hoje) {
  return !!item.validade && item.validade < hoje;
}

function abaixoDoMinimo(item) {
  return item.estoqueMinimo !== null && item.estoqueMinimo !== undefined && item.quantidade < item.estoqueMinimo;
}

function compararCampo(a, b) {
  if (a < b) return -1;
  if (a > b) return 1;
  return 0;
}

// Busca com filtros combináveis (RF22). Todos os filtros são opcionais.
//   termo: parte do nome, já normalizada (minúsculas, sem acento)
//   tipo, localId: filtros exatos
//   filtro: 'vencendo' | 'vencidos' | 'abaixo-minimo' (parâmetro vindo do Painel)
export async function listar({ termo, tipo, localId, filtro, hoje, limiteVencendo } = {}) {
  const db = await getDb();
  const lista = db.itens.filter((i) => {
    if (i.arquivado) return false;
    if (termo && !i.nomeBusca.includes(termo)) return false;
    if (tipo && i.tipo !== tipo) return false;
    if (localId && i.localId !== localId) return false;
    if (filtro === 'vencendo') return vencendo(i, hoje, limiteVencendo);
    if (filtro === 'vencidos') return vencido(i, hoje);
    if (filtro === 'abaixo-minimo') return abaixoDoMinimo(i);
    return true;
  });

  const porValidade = filtro === 'vencendo' || filtro === 'vencidos';
  lista.sort(
    (a, b) => (porValidade ? compararCampo(a.validade, b.validade) : 0) || compararCampo(a.nomeBusca, b.nomeBusca)
  );

  const totais = emprestadoPorItem(db);
  return lista.map((i) => comEmprestado(i, totais));
}

export async function buscarPorId(id) {
  const db = await getDb();
  const item = db.itens.find((i) => i.id === id);
  return item ? comEmprestado(item, emprestadoPorItem(db)) : null;
}

// Itens ativos com o mesmo nome (normalizado). A comparação do fabricante é feita no serviço.
export async function listarPorNomeBusca(nomeBusca) {
  const db = await getDb();
  return db.itens.filter((i) => !i.arquivado && i.nomeBusca === nomeBusca).map((i) => ({ ...i }));
}

export async function contarPorLocal(localId) {
  const db = await getDb();
  return db.itens.filter((i) => i.localId === localId && !i.arquivado).length;
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
    arquivado: false,
    criadoPor: dados.criadoPor ?? null,
    criadoEm: dados.criadoEm || agora,
    updatedAt: agora,
  };
  db.itens.push(item);
  await salvar();
  return { ...item, emprestado: 0 };
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
  const item = db.itens.find((i) => i.id === id);
  if (!nomes.length || !item) return;
  for (const c of nomes) item[c] = campos[c];
  item.updatedAt = agoraISO();
  await salvar();
}

// Soma `delta` ao saldo (negativo na retirada/consumo, positivo na devolução).
// Nunca deixa o saldo negativo: devolve false se a alteração não foi aplicada.
export async function ajustarQuantidade(id, delta) {
  const db = await getDb();
  const item = db.itens.find((i) => i.id === id && !i.arquivado);
  if (!item) return false;
  const novoSaldo = arredondar(item.quantidade + delta);
  if (novoSaldo < 0) return false;
  item.quantidade = novoSaldo;
  item.updatedAt = agoraISO();
  await salvar();
  return true;
}

export async function arquivar(id) {
  const db = await getDb();
  const item = db.itens.find((i) => i.id === id);
  if (!item) return;
  item.arquivado = true;
  item.updatedAt = agoraISO();
  await salvar();
}

// Mantém a cópia `localDescricao` (desnormalização da ADR-001) quando um local é renomeado.
export async function atualizarDescricaoDoLocal(localId, descricao) {
  const db = await getDb();
  const agora = agoraISO();
  for (const item of db.itens) {
    if (item.localId === localId) {
      item.localDescricao = descricao;
      item.updatedAt = agora;
    }
  }
  await salvar();
}

// Totais do Painel (RF24).
export async function resumo({ hoje, limiteVencendo }) {
  const db = await getDb();
  const ativos = db.itens.filter((i) => !i.arquivado);
  return {
    totalItens: ativos.length,
    vencendo: ativos.filter((i) => vencendo(i, hoje, limiteVencendo)).length,
    vencidos: ativos.filter((i) => vencido(i, hoje)).length,
    abaixoMinimo: ativos.filter(abaixoDoMinimo).length,
  };
}
