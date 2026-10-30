// Funções de texto e números.

const ACENTOS = {
  á: 'a', à: 'a', â: 'a', ã: 'a', ä: 'a',
  é: 'e', è: 'e', ê: 'e', ë: 'e',
  í: 'i', ì: 'i', î: 'i', ï: 'i',
  ó: 'o', ò: 'o', ô: 'o', õ: 'o', ö: 'o',
  ú: 'u', ù: 'u', û: 'u', ü: 'u',
  ç: 'c', ñ: 'n',
};

// Minúsculas e sem acentos, para a busca por parte do nome (RF22, campo nomeBusca da ADR-001).
// Feito com uma tabela própria em vez de String.normalize para funcionar igual em qualquer motor JS.
export function normalizarBusca(texto) {
  return (texto || '')
    .toLowerCase()
    .replace(/[áàâãäéèêëíìîïóòôõöúùûüçñ]/g, (c) => ACENTOS[c])
    .replace(/\s+/g, ' ')
    .trim();
}

// Comparação para ordenar listas por nome, sem diferenciar maiúsculas nem acentos.
export function compararTexto(a, b) {
  const x = normalizarBusca(a);
  const y = normalizarBusca(b);
  if (x < y) return -1;
  if (x > y) return 1;
  return 0;
}

export function primeiroNome(nome) {
  return (nome || '').trim().split(/\s+/)[0] || '';
}

// Lê um número digitado pelo usuário ("2", "0,5", "1.5"). Devolve NaN se o texto não for um número.
export function lerNumero(texto) {
  const limpo = String(texto ?? '').trim().replace(',', '.');
  if (!/^\d+(\.\d+)?$/.test(limpo)) return NaN;
  return Number(limpo);
}

// 3 -> "3"; 0.5 -> "0,5"; 1.25 -> "1,25"
export function formatarNumero(n) {
  if (n === null || n === undefined || Number.isNaN(n)) return '';
  const arredondado = Math.round(n * 1000) / 1000;
  return String(arredondado).replace('.', ',');
}

const PLURAIS = { frasco: 'frascos', litro: 'litros', unidade: 'unidades', caixa: 'caixas' };

// "1 frasco", "3 frascos", "0,5 litro"
export function formatarQuantidade(quantidade, unidade) {
  const usarPlural = quantidade === 0 || quantidade >= 2;
  const nomeUnidade = usarPlural ? PLURAIS[unidade] || unidade : unidade;
  return `${formatarNumero(quantidade)} ${nomeUnidade}`;
}

// "Sala 2 › Armário 3 › Prateleira B" (campo `descricao` dos locais, ADR-001).
export function descreverLocal({ sala, armario, prateleira }) {
  return [sala, armario, prateleira]
    .map((parte) => (parte || '').trim())
    .filter(Boolean)
    .join(' › ');
}

// Texto opcional: string vazia vira null, para não gravar "" no banco.
export function textoOuNulo(valor) {
  const t = (valor ?? '').toString().trim();
  return t.length ? t : null;
}
