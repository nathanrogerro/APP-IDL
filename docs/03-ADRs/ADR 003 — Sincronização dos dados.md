# ADR 003 — Sincronização dos dados

**Status:** Aceita · **Data:** 28/09 · **Revisada:** 28/10 (corrigidas a detecção de exclusões e a origem do `updatedAt`)

## Resumo

No contexto de um sistema que utiliza Firestore e SQLite, diante da necessidade de manter o cache local atualizado sem realizar leituras desnecessárias, decidimos por utilizar **sincronização incremental com `updatedAt` (gerado pelo servidor) e `lastSyncAt`, com exclusão lógica**, para alcançar menor consumo do Firebase e menor transferência de dados, aceitando uma maior complexidade na sincronização.

## Contexto

Baixar todos os itens novamente a cada sincronização poderia gerar muitas leituras.

Por exemplo, em um inventário com **10.000 itens**, se somente **20** fossem alterados, não seria necessário baixar os outros **9.980**.

### Problemas encontrados na revisão

A versão original desta ADR tinha duas falhas:

1. **Exclusões não eram detectadas.** Um documento apagado do Firestore não aparece na consulta `updatedAt > lastSyncAt`, porque ele não existe mais. O SQLite dos outros aparelhos manteria o item para sempre.
2. **O relógio do celular não é confiável.** Se o `updatedAt` fosse gerado pelo aparelho e o relógio de um celular estivesse 10 minutos atrasado, as alterações feitas nele poderiam ficar "antes" do `lastSyncAt` de outro aparelho e nunca ser baixadas.

## Alternativas consideradas

| # | Alternativa | Por que não |
|---|---|---|
| A | Baixar todos os dados novamente | Leituras proporcionais ao tamanho do inventário a cada abertura |
| B | `onSnapshot` na coleção inteira | Mantém uma conexão aberta e cobra leitura por documento alterado em tempo real, inclusive com o app em uso contínuo |
| C | Incremental com **exclusão física** | Não detecta exclusões (falha 1) |
| **D** | **Incremental com exclusão lógica e `serverTimestamp()`** | **Escolhida** |

## Solução

1. Cada documento de `usuarios`, `locais`, `itens` e `emprestimos` possui o campo `updatedAt`, preenchido **sempre** com `serverTimestamp()` (horário do servidor do Firebase), nunca com o relógio do aparelho.
2. **Nada é apagado fisicamente.** "Excluir" grava `arquivado: true` e um novo `updatedAt`. Na sincronização, o documento arquivado chega como qualquer outra alteração, e o SQLite o esconde das listas.
3. `movimentacoes` é somente inclusão (nunca alterada), então é sincronizada pelo campo `dataHora`.
4. O aplicativo armazena um `lastSyncAt` **por coleção** no SQLite.
5. Na sincronização, para cada coleção, são buscados apenas os documentos em que:

   ```
   updatedAt >= lastSyncAt
   ```

   O `>=` (em vez de `>`) evita perder documentos gravados no mesmo instante do último `lastSyncAt`. Os documentos repetidos não causam problema, porque a gravação no SQLite é um *upsert* (insere ou substitui pelo ID).

6. **Quando sincronizar:** ao abrir o app, ao puxar a lista para baixo (*pull to refresh*) e logo após cada gravação feita pelo próprio usuário.
7. A **primeira sincronização** de um aparelho (`lastSyncAt` vazio) baixa tudo uma única vez.
8. O `onSnapshot` será utilizado somente em consultas pequenas que realmente necessitem de atualização em tempo real (por exemplo, os empréstimos abertos do usuário logado).

## Consequências

- **Ganho:** A estratégia reduz leituras e transferências de dados e mantém o SQLite atualizado de forma eficiente.
- **Ganho:** Exclusões chegam a todos os aparelhos.
- **Ganho:** Diferenças de relógio entre aparelhos não fazem alterações se perderem.
- **Custo:** Documentos arquivados continuam ocupando espaço no Firestore e no SQLite. Para o volume de um laboratório, isso é irrelevante.
- **Custo:** Toda consulta de tela precisa filtrar `arquivado = 0`; essa regra fica nos repositórios ([ADR-004](ADR-004-Arquitetura-em-camadas.md)) para não ser esquecida.
- **Custo:** O sistema precisa controlar corretamente `updatedAt`, `lastSyncAt` e possíveis falhas de sincronização: se uma sincronização falhar no meio, o `lastSyncAt` daquela coleção não é atualizado e a próxima tentativa repete a busca.
- **Observação:** Na fase local não há sincronização, porque o Firestore ainda não é usado ([ADR-002](ADR-002-Persistencia-local-remota.md)). A exclusão lógica, porém, já é implementada desde agora.
