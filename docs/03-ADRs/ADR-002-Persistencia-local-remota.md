# ADR 002 — Persistência local e remota

## Resumo

No contexto de um aplicativo React Native executado no Expo Go e limitado ao plano gratuito do Firebase, diante da necessidade de armazenar os dados de forma centralizada e reduzir consultas desnecessárias, decidimos por utilizar o Firestore como fonte oficial dos dados e o SQLite como cache local, para alcançar persistência compartilhada e buscas locais, aceitando a necessidade de sincronização entre os dois bancos.

## Contexto

O Firestore permite compartilhar os dados entre diferentes usuários e dispositivos, mas consultas frequentes podem aumentar o consumo da cota gratuita.

O SQLite permite manter uma cópia local dos dados e realizar buscas como:

```
"etan" → "Etanol 70%"
```

Foram consideradas três alternativas:

- utilizar somente o Firestore;
- utilizar somente o SQLite;
- utilizar Firestore + SQLite.

Somente o SQLite não permite compartilhar os dados entre diferentes dispositivos, enquanto utilizar somente o Firestore aumenta a dependência de consultas remotas.

## Solução

- O **Firestore** será a fonte oficial dos dados e o **SQLite** será utilizado como cache local.
- O SQLite será implementado através do [`expo-sqlite`](https://docs.expo.dev/versions/latest/sdk/sqlite/), mantendo a compatibilidade com o Expo Go.
- As escritas exigirão conexão com o Firestore, pois o modo offline completo está fora do escopo do projeto.

## Consequências

- A solução reduz consultas ao Firestore e permite buscas locais mais eficientes.
- Por outro lado, existem duas cópias dos dados, sendo necessário mantê-las sincronizadas.
- O SQLite também pode ficar temporariamente desatualizado.
