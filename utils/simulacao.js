// Ferramenta de demonstração: quando ligada (Perfil → Simular erro nas listagens),
// toda listagem falha de propósito, para mostrar o estado de erro com "Tentar novamente"
// (RNF29). Só aparece no app em modo de desenvolvimento, que é o modo do Expo Go.

let erroNasListagens = false;

export function definirErroSimulado(ativo) {
  erroNasListagens = ativo;
}

export function erroSimuladoAtivo() {
  return erroNasListagens;
}
