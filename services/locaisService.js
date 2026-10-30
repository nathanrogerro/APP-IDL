import * as locaisRepo from '../data/locaisRepository';
import * as itensRepo from '../data/itensRepository';
import { emTransacao } from '../data/db';
import { descreverLocal, normalizarBusca, textoOuNulo } from '../utils/texto';
import { erroDeValidacao, lancarSeHouverErros } from './erros';

// Locais de armazenamento: sala → armário → prateleira (RF12).

// Ordem alfabética ignorando acentos ("Ácidos" junto de "Armário", e não depois de "Sais").
export async function listar() {
  const locais = await locaisRepo.listar();
  return locais.sort((a, b) => normalizarBusca(a.descricao).localeCompare(normalizarBusca(b.descricao)));
}

function validar(form) {
  const campos = {};
  const sala = textoOuNulo(form.sala);
  const armario = textoOuNulo(form.armario);
  const prateleira = textoOuNulo(form.prateleira);
  if (!sala) campos.sala = 'Informe a sala.';
  if (prateleira && !armario) campos.armario = 'Informe o armário da prateleira.';
  lancarSeHouverErros(campos);
  return { sala, armario, prateleira, descricao: descreverLocal({ sala, armario, prateleira }) };
}

async function garantirDescricaoUnica(descricao, ignorarId = null) {
  const existente = await locaisRepo.buscarPorDescricao(descricao);
  if (existente && existente.id !== ignorarId) {
    throw erroDeValidacao('Já existe um local com essa descrição.', { sala: 'Já existe um local com essa descrição.' });
  }
}

export async function criar(form) {
  const dados = validar(form);
  await garantirDescricaoUnica(dados.descricao);
  return locaisRepo.criar(dados);
}

// Ao renomear, atualiza também a cópia da descrição gravada nos itens (ADR-001, consequências).
export async function atualizar(id, form) {
  const local = await locaisRepo.buscarPorId(id);
  if (!local || local.arquivado) throw erroDeValidacao('Local não encontrado.');
  const dados = validar(form);
  await garantirDescricaoUnica(dados.descricao, id);
  await emTransacao(async () => {
    await locaisRepo.atualizar(id, dados);
    await itensRepo.atualizarDescricaoDoLocal(id, dados.descricao);
  });
}

// Exclusão lógica, permitida só para locais vazios (RF12).
export async function excluir(id) {
  const total = await itensRepo.contarPorLocal(id);
  if (total > 0) {
    throw erroDeValidacao(
      `Não é possível excluir: ${total === 1 ? 'há 1 item' : `há ${total} itens`} neste local. Mova-os para outro local antes.`
    );
  }
  await locaisRepo.arquivar(id);
}
