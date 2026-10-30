// Versão para o navegador (npx expo start --web): o expo-file-system não funciona na web,
// então os dados ficam no localStorage. O Metro escolhe este arquivo automaticamente.

const CHAVE = 'labsto-dados';

export async function lerDados() {
  return window.localStorage.getItem(CHAVE);
}

export async function gravarDados(texto) {
  window.localStorage.setItem(CHAVE, texto);
}
