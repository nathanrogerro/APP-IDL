# ADR 002 — Persistência local e remota

**Status:** Aceita · **Data:** 28/09 · **Revisada:** 30/10 (acrescentadas as fases de implementação e a alternativa AsyncStorage)

## Resumo

No contexto de um aplicativo React Native executado no Expo Go e limitado ao plano gratuito do Firebase, diante da necessidade de armazenar os dados de forma centralizada e reduzir consultas desnecessárias, decidimos por utilizar o **Firestore como fonte oficial dos dados** e o **SQLite como cache local**, para alcançar persistência compartilhada e buscas locais, aceitando a necessidade de sincronização entre os dois bancos.

## Contexto

O Firestore permite compartilhar os dados entre diferentes usuários e dispositivos, mas consultas frequentes podem aumentar o consumo da cota gratuita.

O Firestore também **não oferece busca por parte do texto**: ele encontra "Etanol" a partir de "Etanol", mas não a partir de "etan". O SQLite permite manter uma cópia local dos dados e realizar buscas como:

```
"etan" → "Etanol 70%"
```

com `WHERE nomeBusca LIKE '%etan%'`.

## Alternativas consideradas

| # | Alternativa | Por que não |
|---|---|---|
| A | Somente Firestore | Toda busca e toda abertura de tela consome leituras; busca parcial (RF22) não é possível sem serviço externo de busca |
| B | Somente SQLite | Não compartilha os dados entre usuários e aparelhos; não atende o enunciado (persistência remota) |
| C | Firestore + **AsyncStorage** | O AsyncStorage guarda pares chave/valor: filtrar e buscar exigiria carregar tudo na memória a cada consulta |
| **D** | **Firestore + SQLite** | **Escolhida** |

## Solução

- O **Firestore** será a fonte oficial dos dados e o **SQLite** será utilizado como cache local.
- O SQLite será implementado através do [`expo-sqlite`](https://docs.expo.dev/versions/latest/sdk/sqlite/), compatível com o Expo Go.
- As **leituras** (listas, busca, detalhe, painel) são feitas no SQLite.
- As **escritas** são enviadas ao Firestore e, após a confirmação, aplicadas no SQLite. Elas exigem conexão, pois o modo offline completo está fora do escopo do projeto.
- O acesso aos dois bancos fica isolado na camada de repositórios ([ADR-004](ADR-004-Arquitetura-em-camadas.md)): nenhuma tela sabe qual banco está sendo usado.

### Fases de implementação

| Fase | Situação | O que muda |
|---|---|---|
| **Entrega 2** (30/10) | Somente **SQLite**, como banco único | O enunciado da Entrega 2 exige apenas persistência local. O SQLite já é o banco definitivo do lado do aparelho, então nada é descartado depois |
| **Entrega 3** (30/11) | SQLite passa a ser **cache** do Firestore | Só os repositórios mudam: passam a gravar no Firestore e a sincronizar ([ADR-003](ADR-003-Sincronização-dos-dados.md)) |

As tabelas do SQLite seguem exatamente as coleções da [ADR-001](ADR-001-Modelagem-de-dados.md). A versão do esquema é controlada com `PRAGMA user_version`, para aplicar alterações de tabela sem apagar os dados do aparelho.

## Consequências

- **Ganho:** A solução reduz consultas ao Firestore e permite buscas locais por parte do texto.
- **Ganho:** A fase local não usa nenhuma tecnologia que será jogada fora na Entrega 3.
- **Custo:** Existem duas cópias dos dados, sendo necessário mantê-las sincronizadas.
- **Custo:** O SQLite pode ficar temporariamente desatualizado até a próxima sincronização.
- **Custo:** Sem conexão, o usuário consegue consultar, mas não registrar retiradas ou cadastros.
