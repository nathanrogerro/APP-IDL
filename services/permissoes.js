// Matriz de permissões do PRD (seção 6, "Matriz de permissões").
// Nesta fase as permissões controlam o que cada tela mostra (ADR-005). Na Entrega 3,
// as mesmas regras passam a valer também no servidor, pelas Security Rules (ADR-008).

const MATRIZ = {
  gerenciarUsuarios: ['admin'],
  editarItens: ['admin', 'tecnico'],
  editarLocais: ['admin', 'tecnico'],
  movimentar: ['admin', 'tecnico', 'estudante'],
  exportar: ['admin', 'tecnico'],
};

export function pode(usuario, acao) {
  if (!usuario || !usuario.ativo) return false;
  const perfis = MATRIZ[acao];
  return !!perfis && perfis.includes(usuario.perfil);
}
