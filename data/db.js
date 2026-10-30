import { lerDados, gravarDados } from './armazenamento';

// Banco local do aparelho (ADR-002): um arquivo JSON com uma lista por coleção da ADR-001.
// Na abertura, o arquivo é lido uma única vez e fica em memória; cada alteração regrava o
// arquivo inteiro. Para o volume de um laboratório (algumas centenas de registros), a leitura
// e a gravação levam poucos milissegundos.
//
// A versão do formato fica no campo `versao`: cada alteração futura vira um novo passo em
// `migrar`, sem apagar os dados que já estão no aparelho.

const VERSAO_ATUAL = 1;
const COLECOES = ['usuarios', 'locais', 'itens', 'emprestimos', 'movimentacoes'];

let banco = null;
let abertura = null;
let transacaoAberta = false;
let filaDeTransacoes = Promise.resolve();
let filaDeGravacoes = Promise.resolve();

// Devolve sempre o mesmo banco. Se a abertura falhar, a próxima chamada tenta de novo.
export function getDb() {
  if (!abertura) {
    abertura = abrir().catch((erro) => {
      abertura = null;
      throw erro;
    });
  }
  return abertura;
}

async function abrir() {
  const texto = await lerDados();
  let dados = {};
  if (texto) {
    try {
      dados = JSON.parse(texto);
    } catch {
      // Arquivo corrompido (por exemplo, o aparelho desligou no meio de uma gravação):
      // o app recomeça do zero e recria os dados de exemplo.
      console.warn('LabSto: arquivo de dados ilegível; os dados de exemplo serão recriados.');
      dados = {};
    }
  }
  migrar(dados);
  protegerHistorico(dados);
  banco = dados;
  return banco;
}

function migrar(dados) {
  const versao = dados.versao || 0;
  if (versao < 1) {
    for (const colecao of COLECOES) dados[colecao] = dados[colecao] || [];
    dados.configuracoes = dados.configuracoes || {};
  }
  // Exemplo de alteração futura:
  // if (versao < 2) {
  //   dados.itens.forEach((item) => { item.novoCampo = null; });
  // }
  dados.versao = VERSAO_ATUAL;
}

// O histórico é imutável (RNF20): além de o repositório só oferecer inclusão, cada
// movimentação fica congelada, e qualquer tentativa de alterá-la gera erro.
function protegerHistorico(dados) {
  dados.movimentacoes.forEach((m) => Object.freeze(m));
}

// Grava o banco no arquivo. Dentro de uma transação, a gravação fica para o final dela.
export async function salvar() {
  if (transacaoAberta) return;
  await gravarArquivo();
}

// As gravações entram em fila, para que uma gravação antiga nunca termine depois de uma nova.
function gravarArquivo() {
  const texto = JSON.stringify(banco);
  const gravacao = filaDeGravacoes.then(() => gravarDados(texto));
  filaDeGravacoes = gravacao.catch(() => {});
  return gravacao;
}

// Executa várias alterações como uma só: ou todas são salvas, ou nenhuma (US05).
// Antes de começar, guarda uma cópia do banco; se algum passo falhar, a cópia é restaurada.
// As transações são executadas uma de cada vez.
export function emTransacao(tarefa) {
  const execucao = filaDeTransacoes.then(() => executarTransacao(tarefa));
  filaDeTransacoes = execucao.catch(() => {});
  return execucao;
}

async function executarTransacao(tarefa) {
  const db = await getDb();
  const copia = JSON.stringify(db);
  let resultado;

  transacaoAberta = true;
  try {
    resultado = await tarefa();
  } catch (erro) {
    restaurar(db, copia);
    throw erro;
  } finally {
    transacaoAberta = false;
  }

  try {
    await gravarArquivo();
  } catch (erro) {
    restaurar(db, copia);
    throw erro;
  }
  return resultado;
}

function restaurar(db, copia) {
  const anterior = JSON.parse(copia);
  for (const chave of Object.keys(db)) delete db[chave];
  Object.assign(db, anterior);
  protegerHistorico(db);
}

// Apaga os dados das coleções (usado por "Restaurar dados de exemplo").
// As configurações são mantidas, para não derrubar a sessão aberta.
export async function apagarColecoes() {
  const db = await getDb();
  for (const colecao of COLECOES) db[colecao] = [];
  await salvar();
}
