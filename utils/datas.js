// Funções de data.
//
// Datas sem horário (validade, data prevista de devolução) são guardadas como texto
// 'AAAA-MM-DD' (ADR-001, decisão 6). Todas as contas abaixo usam o calendário LOCAL do
// aparelho e Date.UTC só como "régua" de dias, para não sofrer com fuso horário nem
// com horário de verão.

function doisDigitos(n) {
  return String(n).padStart(2, '0');
}

// Data de hoje no fuso do aparelho, no formato 'AAAA-MM-DD'.
export function hojeISO() {
  const d = new Date();
  return `${d.getFullYear()}-${doisDigitos(d.getMonth() + 1)}-${doisDigitos(d.getDate())}`;
}

// Data e hora atuais completas, para campos como criadoEm, updatedAt e dataHora.
export function agoraISO() {
  return new Date().toISOString();
}

function partes(iso) {
  const [ano, mes, dia] = iso.split('-').map(Number);
  return { ano, mes, dia };
}

function paraDiasUTC(iso) {
  const { ano, mes, dia } = partes(iso);
  return Date.UTC(ano, mes - 1, dia) / 86400000;
}

export function somarDias(iso, dias) {
  const { ano, mes, dia } = partes(iso);
  const d = new Date(Date.UTC(ano, mes - 1, dia + dias));
  return `${d.getUTCFullYear()}-${doisDigitos(d.getUTCMonth() + 1)}-${doisDigitos(d.getUTCDate())}`;
}

// Quantos dias faltam de `deIso` até `ateIso` (negativo se `ateIso` já passou).
export function diferencaEmDias(deIso, ateIso) {
  return Math.round(paraDiasUTC(ateIso) - paraDiasUTC(deIso));
}

// '2026-11-03' -> '03/11/2026'
export function isoParaBr(iso) {
  if (!iso) return '';
  const { ano, mes, dia } = partes(iso);
  return `${doisDigitos(dia)}/${doisDigitos(mes)}/${ano}`;
}

// '03/11/2026' -> '2026-11-03'. Devolve null se a data não existir (ex.: 31/02/2026).
export function brParaIso(texto) {
  const m = /^(\d{2})\/(\d{2})\/(\d{4})$/.exec((texto || '').trim());
  if (!m) return null;
  const dia = Number(m[1]);
  const mes = Number(m[2]);
  const ano = Number(m[3]);
  if (ano < 1900 || ano > 2200 || mes < 1 || mes > 12 || dia < 1) return null;
  const d = new Date(Date.UTC(ano, mes - 1, dia));
  if (d.getUTCMonth() !== mes - 1 || d.getUTCDate() !== dia) return null;
  return `${ano}-${doisDigitos(mes)}-${doisDigitos(dia)}`;
}

// Aplica a máscara DD/MM/AAAA enquanto o usuário digita.
export function mascararData(texto) {
  const digitos = (texto || '').replace(/\D/g, '').slice(0, 8);
  if (digitos.length <= 2) return digitos;
  if (digitos.length <= 4) return `${digitos.slice(0, 2)}/${digitos.slice(2)}`;
  return `${digitos.slice(0, 2)}/${digitos.slice(2, 4)}/${digitos.slice(4)}`;
}

// Data/hora de um registro, para exibir no histórico: "hoje às 08:30", "ontem às 14:15",
// "25/09/2026 às 10:00".
export function formatarDataHora(isoCompleto) {
  if (!isoCompleto) return '';
  const d = new Date(isoCompleto);
  const dataLocal = `${d.getFullYear()}-${doisDigitos(d.getMonth() + 1)}-${doisDigitos(d.getDate())}`;
  const hora = `${doisDigitos(d.getHours())}:${doisDigitos(d.getMinutes())}`;
  const dias = diferencaEmDias(dataLocal, hojeISO());
  if (dias === 0) return `hoje às ${hora}`;
  if (dias === 1) return `ontem às ${hora}`;
  return `${isoParaBr(dataLocal)} às ${hora}`;
}

// Texto curto sobre a validade: "Vence hoje", "Vence em 5 dias", "Venceu há 7 dias".
export function descreverValidade(validade, hoje = hojeISO()) {
  if (!validade) return '';
  const dias = diferencaEmDias(hoje, validade);
  if (dias === 0) return 'Vence hoje';
  if (dias === 1) return 'Vence amanhã';
  if (dias > 1) return `Vence em ${dias} dias`;
  if (dias === -1) return 'Venceu ontem';
  return `Venceu há ${-dias} dias`;
}

export function plural(n, singular, pluralTexto) {
  return n === 1 ? singular : pluralTexto;
}
