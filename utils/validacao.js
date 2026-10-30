// Validações de formato reutilizadas pelos serviços e pelos formulários.

export function emailValido(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test((email || '').trim());
}

// Regras de senha do RNF09: no mínimo 8 caracteres, 1 letra e 1 número.
export function regrasDaSenha(senha) {
  const s = senha || '';
  return {
    tamanho: s.length >= 8,
    letra: /[A-Za-zÀ-ÿ]/.test(s),
    numero: /\d/.test(s),
  };
}

export function senhaValida(senha) {
  const r = regrasDaSenha(senha);
  return r.tamanho && r.letra && r.numero;
}

// Número CAS: formato NNNNNNN-NN-N com dígito verificador.
// O dígito final é a soma de cada dígito multiplicado pela sua posição (da direita
// para a esquerda, começando em 1), módulo 10. Ex.: acetona 67-64-1.
export function casValido(cas) {
  const m = /^(\d{2,7})-(\d{2})-(\d)$/.exec((cas || '').trim());
  if (!m) return false;
  const digitos = (m[1] + m[2]).split('').reverse();
  const soma = digitos.reduce((total, d, i) => total + Number(d) * (i + 1), 0);
  return soma % 10 === Number(m[3]);
}
