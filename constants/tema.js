// Cores, espaçamentos e tamanhos usados em todo o app.
// A paleta segue o protótipo da Entrega 1 (azul-ardósia + verde-azulado).
// Todas as combinações de texto/fundo usadas nas telas têm contraste >= 4,5:1 (RNF23).

export const cores = {
  primaria: '#0F766E', // texto branco sobre ela: 5,5:1
  primariaEscura: '#115E59',
  primariaClara: '#F0FDFA',
  primariaBorda: '#99F6E4',
  destaque: '#2DD4BF', // usado só sobre fundo escuro

  cabecalho: '#0F172A',
  fundo: '#F8FAFC',
  superficie: '#FFFFFF',
  superficieSuave: '#F1F5F9',
  borda: '#E2E8F0',
  bordaForte: '#CBD5E1',

  texto: '#0F172A',
  textoSecundario: '#475569',
  textoSuave: '#64748B',
  textoInverso: '#FFFFFF',

  perigo: '#B91C1C',
  perigoFundo: '#FEE2E2',
  perigoBorda: '#FCA5A5',
  alerta: '#92400E',
  alertaFundo: '#FEF3C7',
  alertaBorda: '#FCD34D',
  sucesso: '#166534',
  sucessoFundo: '#DCFCE7',
  sucessoBorda: '#86EFAC',
  info: '#1E40AF',
  infoFundo: '#DBEAFE',
  infoBorda: '#93C5FD',
};

export const espaco = { xs: 4, sm: 8, md: 12, lg: 16, xl: 24, xxl: 32 };

export const raio = { sm: 6, md: 10, lg: 14, pilula: 999 };

export const fonte = { pequena: 12, normal: 15, media: 17, grande: 20, titulo: 26 };

// Área mínima de toque (RNF24): 48 x 48 dp.
export const TOQUE_MINIMO = 48;

export const sombra = {
  shadowColor: '#0F172A',
  shadowOpacity: 0.06,
  shadowRadius: 6,
  shadowOffset: { width: 0, height: 2 },
  elevation: 2,
};
