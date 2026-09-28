# ADR 001 — Modelagem dos dados

## Resumo

No contexto de um aplicativo de inventário para laboratórios, diante da necessidade de organizar itens, usuários, empréstimos e movimentações, decidimos por uma modelagem baseada em entidades relacionadas por identificadores, para alcançar organização e consistência dos dados, aceitando uma maior complexidade nas consultas.

## Contexto

O sistema precisa armazenar diferentes tipos de informações e relacionamentos. Um item pode possuir vários empréstimos e movimentações, enquanto um usuário pode ser responsável por diversos empréstimos.

Foram consideradas duas alternativas principais:

- armazenar todas as informações em uma única estrutura;
- separar os principais conceitos em entidades relacionadas.

A primeira opção seria mais simples inicialmente, mas poderia gerar duplicação de dados e dificultar a manutenção.

## Solução

Serão utilizadas entidades separadas para os principais conceitos:

- **Usuário**
- **Item**
- **Empréstimo**
- **Movimentação**

Os relacionamentos serão realizados por identificadores, por exemplo:

| Campo de origem         | Referência   |
| ----------------------- | ------------ |
| `Empréstimo.itemId`     | `Item.id`    |
| `Empréstimo.usuarioId`  | `Usuário.id` |
| `Movimentação.itemId`   | `Item.id`    |

## Consequências

- A separação reduz a duplicação e facilita a manutenção e evolução do sistema.
- Como consequência, algumas consultas precisarão acessar mais de uma entidade para obter todas as informações necessárias.
