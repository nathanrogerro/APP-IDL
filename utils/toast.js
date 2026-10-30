// Mensagem rápida de confirmação ("Retirada registrada") exibida no topo da tela.
// É só um aviso visual: um emissor de eventos simples que o componente <Toast /> escuta.

const ouvintes = new Set();

export function mostrarToast(mensagem, tipo = 'sucesso') {
  const aviso = { id: Date.now(), mensagem, tipo };
  ouvintes.forEach((ouvinte) => ouvinte(aviso));
}

export function ouvirToast(ouvinte) {
  ouvintes.add(ouvinte);
  return () => ouvintes.delete(ouvinte);
}
