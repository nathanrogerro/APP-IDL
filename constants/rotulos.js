// Textos fixos e opções de seleção usados nas telas e nos serviços.

export const TIPOS_ITEM = [
  { valor: 'reagente', rotulo: 'Reagente', icone: 'flask-outline' },
  { valor: 'vidraria', rotulo: 'Vidraria', icone: 'beaker-outline' },
  { valor: 'equipamento', rotulo: 'Equipamento', icone: 'hardware-chip-outline' },
];

export const UNIDADES = [
  { valor: 'frasco', rotulo: 'Frasco(s)' },
  { valor: 'litro', rotulo: 'Litro(s)' },
  { valor: 'unidade', rotulo: 'Unidade(s)' },
  { valor: 'caixa', rotulo: 'Caixa(s)' },
];

export const FINALIDADES = [
  { valor: 'Aula prática', rotulo: 'Aula prática' },
  { valor: 'Pesquisa IC', rotulo: 'Pesquisa IC' },
  { valor: 'Análise de rotina', rotulo: 'Análise de rotina' },
];

export const PERFIS = [
  { valor: 'admin', rotulo: 'Administrador' },
  { valor: 'tecnico', rotulo: 'Técnico' },
  { valor: 'estudante', rotulo: 'Estudante' },
];

// Filtros que o Painel envia ao Inventário pelo parâmetro de rota `filtro` (PRD, seção 9).
export const FILTROS_INVENTARIO = {
  vencendo: 'Vencendo',
  vencidos: 'Vencidos',
  'abaixo-minimo': 'Abaixo do mínimo',
};

export const TIPOS_MOVIMENTACAO = {
  cadastro: { rotulo: 'Cadastro', icone: 'add-circle-outline' },
  edicao: { rotulo: 'Edição', icone: 'create-outline' },
  retirada: { rotulo: 'Retirada', icone: 'arrow-up-circle-outline' },
  devolucao: { rotulo: 'Devolução', icone: 'arrow-down-circle-outline' },
  consumo: { rotulo: 'Consumo', icone: 'water-outline' },
  exclusao: { rotulo: 'Exclusão', icone: 'trash-outline' },
};

export function rotuloDe(lista, valor) {
  const opcao = lista.find((o) => o.valor === valor);
  return opcao ? opcao.rotulo : valor;
}
