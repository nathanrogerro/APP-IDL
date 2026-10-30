import * as itensRepo from '../data/itensRepository';
import * as locaisRepo from '../data/locaisRepository';
import * as emprestimosRepo from '../data/emprestimosRepository';
import * as movimentacoesRepo from '../data/movimentacoesRepository';
import { emTransacao } from '../data/db';
import { hojeISO, somarDias, diferencaEmDias, brParaIso, isoParaBr } from '../utils/datas';
import { normalizarBusca, lerNumero, textoOuNulo, formatarNumero } from '../utils/texto';
import { casValido } from '../utils/validacao';
import { erroDeValidacao, lancarSeHouverErros } from './erros';

// Regras de negócio dos itens do inventário (RF07, RF11, RF13, RF18, RF19, RF21, RF22, RF23).

const TIPOS = ['reagente', 'vidraria', 'equipamento'];
const UNIDADES = ['frasco', 'litro', 'unidade', 'caixa'];

// Status calculado (nunca gravado, ADR-001 decisão 7).
export function calcularStatus(item, { hoje = hojeISO(), diasAlerta = 30 } = {}) {
  let validade = null;
  let diasParaVencer = null;
  if (item.validade) {
    diasParaVencer = diferencaEmDias(hoje, item.validade);
    if (diasParaVencer < 0) validade = 'vencido';
    else if (diasParaVencer <= diasAlerta) validade = 'vencendo';
    else validade = 'ok';
  }
  return {
    validade,
    diasParaVencer,
    abaixoMinimo: item.estoqueMinimo !== null && item.estoqueMinimo !== undefined && item.quantidade < item.estoqueMinimo,
    emprestado: item.emprestado || 0,
    semSaldo: item.quantidade <= 0,
  };
}

function comStatus(item, opcoes) {
  return { ...item, status: calcularStatus(item, opcoes) };
}

// Busca com filtros combináveis (RF22) e filtros do Painel (vencendo, vencidos, abaixo do mínimo).
export async function listar({ busca = '', tipo = null, localId = null, filtro = null, diasAlerta = 30 } = {}) {
  const hoje = hojeISO();
  const itens = await itensRepo.listar({
    termo: normalizarBusca(busca),
    tipo,
    localId,
    filtro,
    hoje,
    limiteVencendo: somarDias(hoje, diasAlerta),
  });
  return itens.map((item) => comStatus(item, { hoje, diasAlerta }));
}

export async function obter(id, { diasAlerta = 30 } = {}) {
  const item = await itensRepo.buscarPorId(id);
  if (!item || item.arquivado) {
    throw erroDeValidacao('Item não encontrado. Ele pode ter sido excluído.');
  }
  return comStatus(item, { diasAlerta });
}

// Histórico de movimentação, do mais recente para o mais antigo (RF23).
export async function historico(itemId) {
  return movimentacoesRepo.listarPorItem(itemId);
}

// Valores do formulário de edição, no formato que os campos de texto usam.
export function paraFormulario(item) {
  return {
    tipo: item.tipo,
    nome: item.nome,
    quantidade: formatarNumero(item.quantidade),
    unidade: item.unidade,
    localId: item.localId,
    localDescricao: item.localDescricao,
    fabricante: item.fabricante || '',
    concentracao: item.concentracao || '',
    lote: item.lote || '',
    cas: item.cas || '',
    validade: isoParaBr(item.validade),
    estoqueMinimo: item.estoqueMinimo === null || item.estoqueMinimo === undefined ? '' : formatarNumero(item.estoqueMinimo),
    observacoes: item.observacoes || '',
  };
}

// Converte o que foi digitado e valida TODOS os campos de uma vez (US04).
async function validarFormulario(form) {
  const campos = {};

  const tipo = form.tipo;
  if (!TIPOS.includes(tipo)) campos.tipo = 'Escolha o tipo do material.';

  const nome = (form.nome || '').trim();
  if (!nome) campos.nome = 'Informe o nome do item.';
  else if (nome.length > 120) campos.nome = 'Use no máximo 120 caracteres.';

  const quantidade = lerNumero(form.quantidade);
  if (Number.isNaN(quantidade)) campos.quantidade = 'Informe a quantidade (ex.: 3 ou 0,5).';

  if (!UNIDADES.includes(form.unidade)) campos.unidade = 'Escolha a unidade.';

  let local = null;
  if (!form.localId) {
    campos.localId = 'Escolha o local onde o item fica guardado.';
  } else {
    local = await locaisRepo.buscarPorId(form.localId);
    if (!local || local.arquivado) campos.localId = 'Esse local não existe mais. Escolha outro.';
  }

  let validade = null;
  const textoValidade = (form.validade || '').trim();
  if (textoValidade) {
    validade = brParaIso(textoValidade);
    if (!validade) campos.validade = 'Data inválida. Use o formato DD/MM/AAAA.';
  } else if (tipo === 'reagente') {
    campos.validade = 'A validade é obrigatória para reagentes.';
  }

  let estoqueMinimo = null;
  if ((form.estoqueMinimo || '').trim()) {
    estoqueMinimo = lerNumero(form.estoqueMinimo);
    if (Number.isNaN(estoqueMinimo)) campos.estoqueMinimo = 'Informe um número (ex.: 2).';
  }

  const reagente = tipo === 'reagente';
  const cas = reagente ? textoOuNulo(form.cas) : null;
  if (cas && !casValido(cas)) campos.cas = 'Número CAS inválido. Confira os dígitos (ex.: 67-64-1).';

  lancarSeHouverErros(campos);

  return {
    tipo,
    nome,
    nomeBusca: normalizarBusca(nome),
    quantidade,
    unidade: form.unidade,
    localId: local.id,
    localDescricao: local.descricao,
    validade,
    estoqueMinimo,
    fabricante: textoOuNulo(form.fabricante),
    concentracao: reagente ? textoOuNulo(form.concentracao) : null,
    lote: textoOuNulo(form.lote),
    cas,
    observacoes: textoOuNulo(form.observacoes),
  };
}

// Possível duplicidade: mesmo nome e mesmo fabricante (RF13).
async function encontrarDuplicado({ nomeBusca, fabricante }, ignorarId = null) {
  const candidatos = await itensRepo.listarPorNomeBusca(nomeBusca);
  const fabricanteBusca = normalizarBusca(fabricante);
  return candidatos.find((i) => i.id !== ignorarId && normalizarBusca(i.fabricante) === fabricanteBusca) || null;
}

function erroDeDuplicidade(existente) {
  const erro = erroDeValidacao('Já existe um item com este nome e fabricante.');
  erro.duplicado = { id: existente.id, nome: existente.nome, localDescricao: existente.localDescricao };
  return erro;
}

// Cadastro (RF07). Se houver possível duplicidade, lança um erro com `duplicado`; a tela
// mostra o aviso com link para o item existente e pode repetir com `confirmarDuplicado`.
export async function criar(form, usuario, { confirmarDuplicado = false } = {}) {
  const dados = await validarFormulario(form);

  if (!confirmarDuplicado) {
    const existente = await encontrarDuplicado(dados);
    if (existente) throw erroDeDuplicidade(existente);
  }

  return emTransacao(async () => {
    const item = await itensRepo.criar({ ...dados, origem: 'manual', criadoPor: usuario.id });
    await movimentacoesRepo.criar({
      itemId: item.id,
      itemNome: item.nome,
      tipo: 'cadastro',
      quantidade: item.quantidade,
      usuarioId: usuario.id,
      usuarioNome: usuario.nome,
      observacao: 'cadastro manual',
    });
    return item;
  });
}

const NOMES_DOS_CAMPOS = {
  tipo: 'tipo',
  nome: 'nome',
  quantidade: 'quantidade',
  unidade: 'unidade',
  localId: 'local',
  validade: 'validade',
  estoqueMinimo: 'estoque mínimo',
  fabricante: 'fabricante',
  concentracao: 'concentração',
  lote: 'lote',
  cas: 'número CAS',
  observacoes: 'observações',
};

// Edição (RF11). Registra no histórico quais campos mudaram.
export async function atualizar(id, form, usuario, { confirmarDuplicado = false } = {}) {
  const atual = await itensRepo.buscarPorId(id);
  if (!atual || atual.arquivado) throw erroDeValidacao('Item não encontrado. Ele pode ter sido excluído.');

  const dados = await validarFormulario(form);

  const alterados = Object.keys(NOMES_DOS_CAMPOS).filter((campo) => (atual[campo] ?? null) !== (dados[campo] ?? null));
  if (!alterados.length) return atual;

  const mudouIdentificacao =
    dados.nomeBusca !== atual.nomeBusca || normalizarBusca(dados.fabricante) !== normalizarBusca(atual.fabricante);
  if (mudouIdentificacao && !confirmarDuplicado) {
    const existente = await encontrarDuplicado(dados, id);
    if (existente) throw erroDeDuplicidade(existente);
  }

  const descricao = alterados
    .map((campo) =>
      campo === 'quantidade'
        ? `quantidade (${formatarNumero(atual.quantidade)} → ${formatarNumero(dados.quantidade)})`
        : NOMES_DOS_CAMPOS[campo]
    )
    .join(', ');

  await emTransacao(async () => {
    await itensRepo.atualizar(id, dados);
    await movimentacoesRepo.criar({
      itemId: id,
      itemNome: dados.nome,
      tipo: 'edicao',
      usuarioId: usuario.id,
      usuarioNome: usuario.nome,
      observacao: `campos alterados: ${descricao}`,
    });
  });
  return { ...atual, ...dados };
}

// Exclusão lógica (RF11): o item some das listas, mas o histórico continua (ADR-001, ADR-003).
export async function excluir(id, usuario) {
  const item = await itensRepo.buscarPorId(id);
  if (!item || item.arquivado) throw erroDeValidacao('Item não encontrado. Ele pode ter sido excluído.');

  const abertos = await emprestimosRepo.contarAbertosDoItem(id);
  if (abertos > 0) {
    throw erroDeValidacao(
      `Não é possível excluir: ${abertos === 1 ? 'há 1 empréstimo' : `há ${abertos} empréstimos`} deste item em aberto. Registre a devolução antes.`
    );
  }

  await emTransacao(async () => {
    await itensRepo.arquivar(id);
    await movimentacoesRepo.criar({
      itemId: id,
      itemNome: item.nome,
      tipo: 'exclusao',
      usuarioId: usuario.id,
      usuarioNome: usuario.nome,
      observacao: 'item excluído; o histórico foi mantido',
    });
  });
}
