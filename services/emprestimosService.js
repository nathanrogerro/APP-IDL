import * as itensRepo from '../data/itensRepository';
import * as emprestimosRepo from '../data/emprestimosRepository';
import * as movimentacoesRepo from '../data/movimentacoesRepository';
import { emTransacao } from '../data/db';
import { hojeISO, diferencaEmDias, brParaIso, isoParaBr } from '../utils/datas';
import { lerNumero, textoOuNulo, formatarQuantidade } from '../utils/texto';
import { erroDeValidacao, lancarSeHouverErros } from './erros';

// Retirada (empréstimo), consumo e devolução (RF14, RF15, RF16, RF17; US05 e US06).
// Toda operação grava o saldo do item, o empréstimo e o histórico NA MESMA TRANSAÇÃO:
// se qualquer passo falhar, nada é gravado.

function situacao(emprestimo, hoje) {
  const diasRestantes = diferencaEmDias(hoje, emprestimo.dataPrevista);
  return {
    ...emprestimo,
    atrasado: diasRestantes < 0,
    diasDeAtraso: diasRestantes < 0 ? -diasRestantes : 0,
    diasRestantes,
  };
}

// filtro: 'abertos' | 'atrasados' | 'meus'
export async function listar({ filtro = 'abertos', usuarioId = null } = {}) {
  const hoje = hojeISO();
  const lista = await emprestimosRepo.listarAbertos({
    hoje,
    usuarioId: filtro === 'meus' ? usuarioId : null,
    somenteAtrasados: filtro === 'atrasados',
  });
  return lista.map((e) => situacao(e, hoje));
}

export async function listarDoItem(itemId) {
  const hoje = hojeISO();
  const lista = await emprestimosRepo.listarAbertos({ hoje, itemId });
  return lista.map((e) => situacao(e, hoje));
}

async function itemDisponivel(itemId) {
  const item = await itensRepo.buscarPorId(itemId);
  if (!item || item.arquivado) throw erroDeValidacao('Item não encontrado. Ele pode ter sido excluído.');
  return item;
}

function lerQuantidade(valor) {
  const quantidade = typeof valor === 'number' ? valor : lerNumero(valor);
  if (Number.isNaN(quantidade) || quantidade <= 0) return null;
  return quantidade;
}

function erroDeSaldo(item) {
  const mensagem = `Saldo insuficiente. Disponível: ${formatarQuantidade(item.quantidade, item.unidade)}.`;
  return erroDeValidacao(mensagem, { quantidade: mensagem });
}

// Retirada com devolução prevista (RF14, US05).
export async function registrarRetirada({ itemId, quantidade, finalidade, dataPrevista, usuario }) {
  const campos = {};
  const qtd = lerQuantidade(quantidade);
  if (qtd === null) campos.quantidade = 'Informe uma quantidade maior que zero.';

  const prevista = brParaIso(dataPrevista);
  if (!prevista) campos.dataPrevista = 'Informe a data prevista de devolução (DD/MM/AAAA).';
  else if (prevista < hojeISO()) campos.dataPrevista = 'A data prevista de devolução não pode estar no passado.';

  if (!textoOuNulo(finalidade)) campos.finalidade = 'Escolha a finalidade.';
  lancarSeHouverErros(campos);

  const item = await itemDisponivel(itemId);
  if (qtd > item.quantidade) throw erroDeSaldo(item);

  return emTransacao(async () => {
    // A baixa só acontece se ainda houver saldo no momento da gravação.
    const baixou = await itensRepo.ajustarQuantidade(item.id, -qtd);
    if (!baixou) throw erroDeSaldo(await itensRepo.buscarPorId(item.id));

    const emprestimo = await emprestimosRepo.criar({
      itemId: item.id,
      itemNome: item.nome,
      usuarioId: usuario.id,
      usuarioNome: usuario.nome,
      quantidade: qtd,
      finalidade,
      dataRetirada: hojeISO(),
      dataPrevista: prevista,
    });
    await movimentacoesRepo.criar({
      itemId: item.id,
      itemNome: item.nome,
      tipo: 'retirada',
      quantidade: qtd,
      usuarioId: usuario.id,
      usuarioNome: usuario.nome,
      observacao: `${finalidade} · devolução prevista para ${isoParaBr(prevista)}`,
    });
    return emprestimo;
  });
}

// Consumo de reagente: baixa sem devolução e sem empréstimo (RF16).
export async function registrarConsumo({ itemId, quantidade, finalidade, usuario }) {
  const qtd = lerQuantidade(quantidade);
  if (qtd === null) {
    throw erroDeValidacao('Informe uma quantidade maior que zero.', {
      quantidade: 'Informe uma quantidade maior que zero.',
    });
  }

  const item = await itemDisponivel(itemId);
  if (item.tipo !== 'reagente') throw erroDeValidacao('O consumo só pode ser registrado para reagentes.');
  if (qtd > item.quantidade) throw erroDeSaldo(item);

  await emTransacao(async () => {
    const baixou = await itensRepo.ajustarQuantidade(item.id, -qtd);
    if (!baixou) throw erroDeSaldo(await itensRepo.buscarPorId(item.id));

    await movimentacoesRepo.criar({
      itemId: item.id,
      itemNome: item.nome,
      tipo: 'consumo',
      quantidade: qtd,
      usuarioId: usuario.id,
      usuarioNome: usuario.nome,
      observacao: textoOuNulo(finalidade),
    });
  });
}

// Devolução (RF15, US06): encerra o empréstimo, devolve a quantidade ao saldo e registra
// no histórico se houve atraso.
export async function registrarDevolucao(emprestimoId, usuario) {
  const emprestimo = await emprestimosRepo.buscarPorId(emprestimoId);
  if (!emprestimo) throw erroDeValidacao('Empréstimo não encontrado.');
  if (emprestimo.dataDevolucao) throw erroDeValidacao('Este empréstimo já foi devolvido.');

  const hoje = hojeISO();
  const atraso = Math.max(0, diferencaEmDias(emprestimo.dataPrevista, hoje));
  const partes = [atraso > 0 ? `devolvido com atraso de ${atraso} ${atraso === 1 ? 'dia' : 'dias'}` : 'devolvido no prazo'];
  if (usuario.id !== emprestimo.usuarioId) partes.push(`retirado por ${emprestimo.usuarioNome}`);

  await emTransacao(async () => {
    const encerrou = await emprestimosRepo.registrarDevolucao(emprestimo.id, hoje);
    if (!encerrou) throw erroDeValidacao('Este empréstimo já foi devolvido.');

    const devolveu = await itensRepo.ajustarQuantidade(emprestimo.itemId, emprestimo.quantidade);
    if (!devolveu) throw erroDeValidacao('O item deste empréstimo não está mais no inventário.');

    await movimentacoesRepo.criar({
      itemId: emprestimo.itemId,
      itemNome: emprestimo.itemNome,
      tipo: 'devolucao',
      quantidade: emprestimo.quantidade,
      usuarioId: usuario.id,
      usuarioNome: usuario.nome,
      observacao: partes.join(' · '),
    });
  });

  return { atraso };
}
