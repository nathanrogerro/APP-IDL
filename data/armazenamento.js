// Leitura e gravação do arquivo de dados no aparelho (Android e iOS), com o expo-file-system,
// que vem embutido no Expo Go (ADR-002). No navegador, o Metro usa armazenamento.web.js.
//
// Os módulos são carregados dentro de try/catch: se a API nova do expo-file-system não estiver
// disponível na versão do Expo Go, o app tenta a API antiga (`expo-file-system/legacy`) em vez
// de fechar com erro.

const NOME_DO_ARQUIVO = 'labsto-dados.json';

let adaptador = null;

function apiAtual() {
  const { File, Paths } = require('expo-file-system');
  const arquivo = new File(Paths.document, NOME_DO_ARQUIVO);
  return {
    async ler() {
      return arquivo.exists ? arquivo.text() : null;
    },
    async gravar(texto) {
      if (!arquivo.exists) arquivo.create();
      await arquivo.write(texto);
    },
  };
}

function apiLegada() {
  const FileSystem = require('expo-file-system/legacy');
  const caminho = `${FileSystem.documentDirectory}${NOME_DO_ARQUIVO}`;
  return {
    async ler() {
      const info = await FileSystem.getInfoAsync(caminho);
      return info.exists ? FileSystem.readAsStringAsync(caminho) : null;
    },
    async gravar(texto) {
      await FileSystem.writeAsStringAsync(caminho, texto);
    },
  };
}

function obterAdaptador() {
  if (!adaptador) {
    try {
      adaptador = apiAtual();
    } catch {
      adaptador = apiLegada();
    }
  }
  return adaptador;
}

// Devolve o conteúdo do arquivo, ou null se ele ainda não existe (primeira execução).
export async function lerDados() {
  return obterAdaptador().ler();
}

export async function gravarDados(texto) {
  await obterAdaptador().gravar(texto);
}
