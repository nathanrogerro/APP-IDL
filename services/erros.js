// Erros de regra de negócio, com mensagem pronta para o usuário (ADR-004, "Tratamento de erros").
//
// `campos` indica a qual campo do formulário cada mensagem pertence, para a tela poder
// destacar o campo certo. Ex.: { quantidade: 'Saldo insuficiente. Disponível: 3 frascos.' }

export function erroDeValidacao(mensagem, campos = null) {
  const erro = new Error(mensagem);
  erro.name = 'ErroDeValidacao';
  erro.campos = campos;
  return erro;
}

export function ehErroDeValidacao(erro) {
  return !!erro && erro.name === 'ErroDeValidacao';
}

// Junta vários erros de campo em um só (formulários validam todos os campos de uma vez).
export function lancarSeHouverErros(campos) {
  const chaves = Object.keys(campos);
  if (chaves.length) {
    throw erroDeValidacao(campos[chaves[0]], campos);
  }
}

// Mensagem a exibir para qualquer erro: regra de negócio mostra o próprio texto;
// erro técnico (banco, código) mostra uma mensagem genérica.
export function mensagemDoErro(erro, padrao = 'Não foi possível concluir a operação. Tente novamente.') {
  if (ehErroDeValidacao(erro)) return erro.message;
  if (erro && erro.name === 'ErroSimulado') return erro.message;
  return padrao;
}
