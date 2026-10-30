import { getDb, emTransacao, recriarTabelas } from './db';
import * as usuariosRepo from './usuariosRepository';
import * as locaisRepo from './locaisRepository';
import * as itensRepo from './itensRepository';
import * as emprestimosRepo from './emprestimosRepository';
import * as movimentacoesRepo from './movimentacoesRepository';
import { hojeISO, somarDias, isoParaBr } from '../utils/datas';
import { normalizarBusca, descreverLocal } from '../utils/texto';

// Dados de exemplo (README, "Dados de exemplo"). As datas são calculadas a partir do dia
// em que o banco é criado, para que sempre existam reagentes vencidos, reagentes vencendo
// e um empréstimo atrasado, e o Painel tenha conteúdo na demonstração.

const USUARIOS = [
  { id: 'exemplo-admin', nome: 'Carlos Silva', email: 'admin@labsto.dev', perfil: 'admin' },
  { id: 'exemplo-tecnico', nome: 'João Pereira', email: 'tecnico@labsto.dev', perfil: 'tecnico' },
  { id: 'exemplo-estudante', nome: 'Ana Souza', email: 'estudante@labsto.dev', perfil: 'estudante' },
  { id: 'exemplo-desativado', nome: 'Bruno Lima', email: 'bruno@labsto.dev', perfil: 'estudante', ativo: false },
];

const LOCAIS = {
  inflamaveisA: { sala: 'Sala 1', armario: 'Armário de Inflamáveis', prateleira: 'Prateleira A' },
  inflamaveisB: { sala: 'Sala 1', armario: 'Armário de Inflamáveis', prateleira: 'Prateleira B' },
  acidos: { sala: 'Sala 1', armario: 'Armário de Ácidos e Bases', prateleira: 'Prateleira A' },
  sais: { sala: 'Sala 1', armario: 'Armário de Sais', prateleira: 'Prateleira A' },
  geladeira: { sala: 'Sala 2', armario: 'Geladeira 02', prateleira: 'Prateleira A' },
  vidraria: { sala: 'Sala 2', armario: 'Armário de Vidraria', prateleira: 'Gaveta 1' },
  bancada: { sala: 'Sala 2', armario: 'Bancada de Equipamentos', prateleira: null },
  vazio: { sala: 'Sala 3', armario: 'Armário 4', prateleira: 'Prateleira C' },
};

// validade: dias a partir de hoje (negativo = já vencido). quantidadeInicial: quantidade
// no cadastro, antes das retiradas/consumos registrados mais abaixo.
const ITENS = {
  acetona: { tipo: 'reagente', nome: 'Acetona PA 99,5%', concentracao: '99,5%', fabricante: 'Synth', lote: 'A2291', cas: '67-64-1', validade: 5, quantidadeInicial: 4, unidade: 'frasco', estoqueMinimo: 2, local: 'inflamaveisB' },
  etanol70: { tipo: 'reagente', nome: 'Etanol 70%', concentracao: '70%', fabricante: 'Química Moderna', lote: 'ET7031', cas: '64-17-5', validade: 210, quantidadeInicial: 6, unidade: 'frasco', estoqueMinimo: 4, local: 'inflamaveisA' },
  etanolAbsoluto: { tipo: 'reagente', nome: 'Etanol absoluto 99,8%', concentracao: '99,8%', fabricante: 'Dinâmica', lote: 'EA2210', cas: '64-17-5', validade: 420, quantidadeInicial: 2, unidade: 'frasco', estoqueMinimo: 1, local: 'inflamaveisA' },
  fenolftaleina: { tipo: 'reagente', nome: 'Fenolftaleína 1%', concentracao: '1%', fabricante: 'Neon', lote: 'FF0110', cas: '77-09-8', validade: 12, quantidadeInicial: 1, unidade: 'frasco', local: 'inflamaveisA' },
  nitratoPrata: { tipo: 'reagente', nome: 'Nitrato de prata 0,1 M', concentracao: '0,1 M', fabricante: 'Labsynth', lote: 'NP0921', cas: '7761-88-8', validade: -7, quantidadeInicial: 1, unidade: 'frasco', local: 'geladeira', observacoes: 'Manter ao abrigo da luz.' },
  tampao: { tipo: 'reagente', nome: 'Solução tampão pH 7,00', concentracao: '0,05 M', fabricante: 'Labsynth', lote: '2024-B90', validade: 350, quantidadeInicial: 2, unidade: 'frasco', estoqueMinimo: 1, local: 'geladeira' },
  acidoCloridrico: { tipo: 'reagente', nome: 'Ácido clorídrico 37%', concentracao: '37%', fabricante: 'Neon', lote: 'HC3712', cas: '7647-01-0', validade: 20, quantidadeInicial: 2, unidade: 'frasco', estoqueMinimo: 2, local: 'acidos' },
  acidoSulfurico: { tipo: 'reagente', nome: 'Ácido sulfúrico 98%', concentracao: '98%', fabricante: 'Dinâmica', lote: 'AS9801', cas: '7664-93-9', validade: -30, quantidadeInicial: 1, unidade: 'frasco', local: 'acidos' },
  hidroxidoSodio: { tipo: 'reagente', nome: 'Hidróxido de sódio em lentilhas', concentracao: 'PA', fabricante: 'Synth', lote: 'HS5520', cas: '1310-73-2', validade: 600, quantidadeInicial: 1, unidade: 'frasco', estoqueMinimo: 2, local: 'acidos' },
  cloretoSodio: { tipo: 'reagente', nome: 'Cloreto de sódio PA', concentracao: 'PA', fabricante: 'Synth', lote: 'CS7730', cas: '7647-14-5', validade: 900, quantidadeInicial: 4, unidade: 'frasco', estoqueMinimo: 1, local: 'sais' },
  bequer: { tipo: 'vidraria', nome: 'Béquer 250 mL', fabricante: 'Vidrolabor', quantidadeInicial: 12, unidade: 'unidade', estoqueMinimo: 6, local: 'vidraria' },
  proveta: { tipo: 'vidraria', nome: 'Proveta graduada 100 mL', fabricante: 'Vidrolabor', quantidadeInicial: 5, unidade: 'unidade', estoqueMinimo: 3, local: 'vidraria' },
  pipeta: { tipo: 'vidraria', nome: 'Pipeta volumétrica 10 mL', fabricante: 'Satelit', quantidadeInicial: 8, unidade: 'unidade', local: 'vidraria' },
  balao: { tipo: 'vidraria', nome: 'Balão volumétrico 500 mL', fabricante: 'Laborglas', quantidadeInicial: 2, unidade: 'unidade', estoqueMinimo: 3, local: 'vidraria' },
  balanca: { tipo: 'equipamento', nome: 'Balança analítica', fabricante: 'Shimadzu', quantidadeInicial: 1, unidade: 'unidade', local: 'bancada', observacoes: 'Modelo AY220, precisão de 0,1 mg. Calibrar antes do uso.' },
  phmetro: { tipo: 'equipamento', nome: 'pHmetro de bancada', fabricante: 'Kasvi', quantidadeInicial: 1, unidade: 'unidade', local: 'bancada' },
  agitador: { tipo: 'equipamento', nome: 'Agitador magnético com aquecimento', fabricante: 'Fisatom', quantidadeInicial: 2, unidade: 'unidade', local: 'bancada' },
  micropipeta: { tipo: 'equipamento', nome: 'Micropipeta 100–1000 µL', fabricante: 'Kasvi', quantidadeInicial: 3, unidade: 'unidade', local: 'bancada' },
};

// Data/hora no passado: `dias` dias atrás, no horário indicado (horário local).
// Se o horário ainda não chegou hoje, usa "agora menos alguns minutos".
function momento(dias, hora = 9, minuto = 0) {
  const d = new Date();
  d.setDate(d.getDate() - dias);
  d.setHours(hora, minuto, 0, 0);
  const limite = Date.now() - 5 * 60 * 1000;
  return new Date(Math.min(d.getTime(), limite)).toISOString();
}

export async function bancoEstaVazio() {
  const db = await getDb();
  const linha = await db.getFirstAsync('SELECT COUNT(*) AS total FROM usuarios');
  return !linha || linha.total === 0;
}

export async function popularDadosDeExemplo() {
  const hoje = hojeISO();

  await emTransacao(async () => {
    const usuarios = {};
    for (const u of USUARIOS) {
      usuarios[u.perfil === 'estudante' && u.ativo === false ? 'desativado' : u.perfil] = await usuariosRepo.criar({
        ...u,
        criadoEm: momento(90),
      });
    }
    const { admin, tecnico, estudante } = usuarios;

    const locais = {};
    for (const [chave, l] of Object.entries(LOCAIS)) {
      locais[chave] = await locaisRepo.criar({ ...l, descricao: descreverLocal(l) });
    }

    // Cadastro dos itens, com a movimentação de cadastro no histórico.
    const itens = {};
    let diasAtras = 60;
    for (const [chave, dados] of Object.entries(ITENS)) {
      const local = locais[dados.local];
      const responsavel = dados.tipo === 'equipamento' ? admin : tecnico;
      const criadoEm = momento(diasAtras, 10, 15);
      diasAtras -= 1;
      const item = await itensRepo.criar({
        tipo: dados.tipo,
        nome: dados.nome,
        nomeBusca: normalizarBusca(dados.nome),
        concentracao: dados.concentracao,
        fabricante: dados.fabricante,
        lote: dados.lote,
        cas: dados.cas,
        observacoes: dados.observacoes,
        validade: dados.validade === undefined ? null : somarDias(hoje, dados.validade),
        quantidade: dados.quantidadeInicial,
        unidade: dados.unidade,
        estoqueMinimo: dados.estoqueMinimo,
        localId: local.id,
        localDescricao: local.descricao,
        criadoPor: responsavel.id,
        criadoEm,
      });
      await movimentacoesRepo.criar({
        itemId: item.id,
        itemNome: item.nome,
        tipo: 'cadastro',
        quantidade: item.quantidade,
        usuarioId: responsavel.id,
        usuarioNome: responsavel.nome,
        observacao: 'cadastro manual',
        dataHora: criadoEm,
      });
      itens[chave] = item;
    }

    // Empréstimo já devolvido (com 1 dia de atraso), para o histórico da balança.
    await registrarEmprestimo({
      item: itens.balanca, usuario: estudante, quantidade: 1, finalidade: 'Análise de rotina',
      retirada: -20, prevista: -15, devolucao: -14, hoje,
    });

    // Empréstimo ATRASADO (data prevista há 3 dias).
    await registrarEmprestimo({
      item: itens.phmetro, usuario: estudante, quantidade: 1, finalidade: 'Pesquisa IC',
      retirada: -10, prevista: -3, hoje,
    });

    // Edição registrada no histórico.
    await movimentacoesRepo.criar({
      itemId: itens.etanol70.id,
      itemNome: itens.etanol70.nome,
      tipo: 'edicao',
      usuarioId: tecnico.id,
      usuarioNome: tecnico.nome,
      observacao: 'campos alterados: estoque mínimo',
      dataHora: momento(5, 16, 40),
    });

    // Empréstimos em dia.
    await registrarEmprestimo({
      item: itens.agitador, usuario: tecnico, quantidade: 1, finalidade: 'Aula prática',
      retirada: -2, prevista: 5, hoje,
    });
    await registrarEmprestimo({
      item: itens.bequer, usuario: estudante, quantidade: 4, finalidade: 'Aula prática',
      retirada: -1, prevista: 6, hoje,
    });

    // Consumo de reagente feito hoje.
    await itensRepo.ajustarQuantidade(itens.acetona.id, -1);
    await movimentacoesRepo.criar({
      itemId: itens.acetona.id,
      itemNome: itens.acetona.nome,
      tipo: 'consumo',
      quantidade: 1,
      usuarioId: admin.id,
      usuarioNome: admin.nome,
      observacao: 'Pesquisa IC',
      dataHora: momento(0, 8, 30),
    });
  });
}

// Grava um empréstimo de exemplo com as mesmas regras do serviço: baixa no saldo e
// movimentações de retirada (e de devolução, se houver).
// retirada, prevista e devolucao: dias em relação a hoje (negativo = no passado).
async function registrarEmprestimo({ item, usuario, quantidade, finalidade, retirada, prevista, devolucao, hoje }) {
  const dataPrevista = somarDias(hoje, prevista);
  const devolvido = devolucao !== undefined;

  await emprestimosRepo.criar({
    itemId: item.id,
    itemNome: item.nome,
    usuarioId: usuario.id,
    usuarioNome: usuario.nome,
    quantidade,
    finalidade,
    dataRetirada: somarDias(hoje, retirada),
    dataPrevista,
    dataDevolucao: devolvido ? somarDias(hoje, devolucao) : null,
  });
  await movimentacoesRepo.criar({
    itemId: item.id,
    itemNome: item.nome,
    tipo: 'retirada',
    quantidade,
    usuarioId: usuario.id,
    usuarioNome: usuario.nome,
    observacao: `${finalidade} · devolução prevista para ${isoParaBr(dataPrevista)}`,
    dataHora: momento(-retirada, 9, 20),
  });
  if (devolvido) {
    const atraso = devolucao - prevista;
    await movimentacoesRepo.criar({
      itemId: item.id,
      itemNome: item.nome,
      tipo: 'devolucao',
      quantidade,
      usuarioId: usuario.id,
      usuarioNome: usuario.nome,
      observacao: atraso > 0 ? `devolvido com atraso de ${atraso} ${atraso === 1 ? 'dia' : 'dias'}` : 'devolvido no prazo',
      dataHora: momento(-devolucao, 15, 5),
    });
  } else {
    await itensRepo.ajustarQuantidade(item.id, -quantidade);
  }
}

export async function restaurarDadosDeExemplo() {
  await recriarTabelas();
  await popularDadosDeExemplo();
}
