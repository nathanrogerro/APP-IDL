# ADR 008 — Atribuição de perfis de usuário

**Status:** Aceita · **Data:** 30/10

## Resumo

No contexto de um app com três perfis de acesso (Administrador, Técnico e Estudante), diante do risco de qualquer pessoa se cadastrar como Administrador, decidimos que **toda conta nova é criada como Estudante e somente um Administrador pode alterar perfis**, para alcançar um controle de acesso que não depende da boa-fé de quem se cadastra, aceitando que o Administrador precisa promover manualmente cada técnico.

## Contexto

- O protótipo da Entrega 1 permitia **escolher o perfil no formulário de cadastro**. Com isso, qualquer pessoa poderia se cadastrar como Administrador e gerenciar usuários e itens.
- A versão anterior do PRD previa um fluxo de **aprovação de novas contas** (RF05), que exigiria uma tela e um estado "aguardando aprovação" a mais.
- O laboratório tem poucos técnicos e professores e muitos estudantes.

## Alternativas consideradas

| # | Alternativa | Por que não |
|---|---|---|
| A | **Escolher o perfil no cadastro** (como no protótipo) | Falha de segurança: qualquer um vira Administrador |
| B | **Código de convite** por perfil | Exige gerar, distribuir e trocar códigos; complexidade desproporcional |
| C | **Aprovação de toda conta nova** pelo Administrador | Os estudantes ficariam bloqueados até a aprovação; mais uma tela e mais um estado |
| **D** | **Cadastro sempre como Estudante + promoção pelo Administrador** | **Escolhida** |

## Solução

1. O formulário de cadastro **não tem** campo de perfil. O documento em `usuarios/{uid}` é criado com `perfil: "estudante"` e `ativo: true`.
2. O Administrador acessa a tela **Usuários** (a partir do Perfil) e pode alterar o perfil e desativar contas (RF05).
3. O **primeiro Administrador** é definido manualmente, editando o documento dele no console do Firebase. Esse passo fica documentado no README.
4. Um usuário com `ativo: false` é desconectado ao entrar e vê "Conta desativada. Procure o responsável pelo laboratório." (US12).
5. **Security Rules (Entrega 3)** garantem a regra também no servidor, e não só na interface:
   - um usuário só pode criar o próprio documento, e apenas com `perfil == "estudante"`;
   - um usuário pode alterar o próprio nome e as configurações, mas **não** `perfil` nem `ativo`;
   - somente quem tem `perfil == "admin"` pode alterar `perfil` e `ativo` de outros usuários.

## Consequências

- **Ganho:** Ninguém se torna Administrador ou Técnico sem a ação de um Administrador.
- **Ganho:** Estudantes, que são a maioria, usam o app imediatamente após o cadastro.
- **Ganho:** A regra vale no servidor (Security Rules), não apenas escondendo botões.
- **Custo:** O Administrador precisa promover cada técnico manualmente.
- **Custo:** A criação do primeiro Administrador é um passo manual no console do Firebase.
- **Custo:** A mudança de perfil vale no próximo acesso da pessoa (ou na próxima sincronização do documento `usuarios`).
