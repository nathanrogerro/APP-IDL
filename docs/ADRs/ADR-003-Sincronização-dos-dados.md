# ADR 003 — Sincronização dos dados

## Resumo

No contexto de um sistema que utiliza Firestore e SQLite, diante da necessidade de manter o cache local atualizado sem realizar leituras desnecessárias, decidimos por utilizar sincronização incremental com `updatedAt` e `lastSyncAt`, para alcançar menor consumo do Firebase e menor transferência de dados, aceitando uma maior complexidade na sincronização.

## Contexto

Baixar todos os itens novamente a cada sincronização poderia gerar muitas leituras.

Por exemplo, em um inventário com **10.000 itens**, se somente **20** fossem alterados, não seria necessário baixar os outros **9.980**.

Foram consideradas três alternativas:

- baixar todos os dados novamente;
- utilizar `onSnapshot` na coleção inteira;
- realizar sincronização incremental.

## Solução

Cada documento possuirá um campo:

```
updatedAt
```

O aplicativo armazenará:

```
lastSyncAt
```

Na sincronização, serão buscados apenas os documentos em que:

```
updatedAt > lastSyncAt
```

O `onSnapshot` será utilizado somente em consultas pequenas que realmente necessitem de atualização em tempo real.

## Consequências

- A estratégia reduz leituras e transferências de dados e mantém o SQLite atualizado de forma mais eficiente.
- Como consequência, o sistema precisa controlar corretamente `updatedAt`, `lastSyncAt` e possíveis falhas de sincronização.
