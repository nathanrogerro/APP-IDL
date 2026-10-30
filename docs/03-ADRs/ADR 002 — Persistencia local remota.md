# ADR 002 — Persistência local e remota

**Status:** Aceita · **Data:** 28/09 · **Revisada:** 28/10 (acrescentadas as fases de implementação e a alternativa AsyncStorage) · 30/10 (banco local trocado do SQLite por um arquivo JSON, ver [Revisão de 30/10](#revisão-de-3010-sqlite--arquivo-json))

## Resumo

No contexto de um aplicativo React Native executado no Expo Go e limitado ao plano gratuito do Firebase, diante da necessidade de armazenar os dados de forma centralizada e reduzir consultas desnecessárias, decidimos por utilizar o **Firestore como fonte oficial dos dados** e um **arquivo JSON no aparelho como cache local**, para alcançar persistência compartilhada e buscas locais, aceitando a necessidade de sincronização entre as duas cópias.

## Contexto

O Firestore permite compartilhar os dados entre diferentes usuários e dispositivos, mas consultas frequentes podem aumentar o consumo da cota gratuita.

O Firestore também **não oferece busca por parte do texto**: ele encontra "Etanol" a partir de "Etanol", mas não a partir de "etan". Uma cópia local dos dados permite fazer buscas como:

```
"etan" → "Etanol 70%"
```

comparando o termo com o campo `nomeBusca` (nome em minúsculas e sem acentos, [ADR-001](ADR%20001%20—%20Modelagem%20de%20dados.md)).

O enunciado exige que o app rode no **Expo Go**, então o banco local só pode usar módulos nativos que já vêm dentro dele.

## Alternativas consideradas

| # | Alternativa | Por que não |
|---|---|---|
| A | Somente Firestore | Toda busca e toda abertura de tela consome leituras; busca parcial (RF22) não é possível sem serviço externo de busca |
| B | Somente banco local | Não compartilha os dados entre usuários e aparelhos; não atende o enunciado (persistência remota) |
| C | Firestore + **AsyncStorage** | Guardaria o mesmo conteúdo do arquivo JSON, mas é um pacote a mais, e o `expo-file-system` já faz parte do próprio Expo |
| D | Firestore + **SQLite** (`expo-sqlite`) | Escolhida em 28/09. Descartada em 30/10: o Expo Go 58 para Android não carrega o módulo nativo do `expo-sqlite` (erro `Cannot find native module 'ExpoSQLite'`) |
| **E** | **Firestore + arquivo JSON** (`expo-file-system`) | **Escolhida** (revisão de 30/10) |

## Solução

- O **Firestore** será a fonte oficial dos dados e um **arquivo JSON no aparelho** (`labsto-dados.json`) será utilizado como cache local.
- O arquivo é lido e gravado com o [`expo-file-system`](https://docs.expo.dev/versions/latest/sdk/filesystem/), que faz parte do próprio pacote `expo` e vem embutido no Expo Go. No navegador (`npx expo start --web`), o mesmo conteúdo fica no `localStorage`.
- As **leituras** (listas, busca, detalhe, painel) são feitas na cópia local.
- As **escritas** são enviadas ao Firestore e, após a confirmação, aplicadas na cópia local. Elas exigem conexão, pois o modo offline completo está fora do escopo do projeto.
- O acesso aos dois bancos fica isolado na camada de repositórios ([ADR-004](ADR%20004%20—%20Arquitetura%20em%20camadas.md)): nenhuma tela sabe qual banco está sendo usado.

### Como o arquivo funciona

- O arquivo tem uma lista para cada coleção da [ADR-001](ADR%20001%20—%20Modelagem%20de%20dados.md), com os mesmos nomes de campos. Além delas, guarda as `configuracoes` do aparelho (pares chave/valor, como a sessão aberta), que não são sincronizadas.
- Na abertura do app, o arquivo é lido uma vez e fica na memória. Cada alteração regrava o arquivo inteiro.
- **Transações** (US05): antes de uma operação com vários passos (por exemplo, retirada = baixa no saldo + empréstimo + histórico), o app guarda uma cópia dos dados. Se algum passo falhar, a cópia é restaurada e nada é gravado.
- **Histórico imutável** (RNF20): o repositório de movimentações só oferece inclusão, e cada registro fica congelado (`Object.freeze`) depois de gravado.
- O campo `versao` controla o formato do arquivo, para aplicar alterações futuras sem apagar os dados do aparelho.

### Fases de implementação

| Fase | Situação | O que muda |
|---|---|---|
| **Entrega 2** (30/10) | Somente o **arquivo local**, como banco único | O enunciado da Entrega 2 exige apenas persistência local. O arquivo já é o banco definitivo do lado do aparelho, então nada é descartado depois |
| **Entrega 3** (30/11) | O arquivo passa a ser **cache** do Firestore | Só os repositórios mudam: passam a gravar no Firestore e a sincronizar ([ADR-003](ADR%20003%20—%20Sincronização%20dos%20dados.md)) |

## Revisão de 30/10: SQLite → arquivo JSON

A primeira versão desta ADR escolheu o SQLite (alternativa D). Ao rodar o app em um celular Android com o **Expo Go 58**, ele fechou na abertura com o erro `Cannot find native module 'ExpoSQLite'`: essa versão do Expo Go não carrega o módulo nativo do `expo-sqlite`. O `expo-crypto`, usado para gerar os IDs, passou pela mesma mudança interna no Expo (migração para a nova versão da API de módulos nativos; no projeto, só esses dois pacotes passaram por ela), então também foi retirado, por precaução. Como o enunciado exige o Expo Go, a equipe trocou o banco local pelo arquivo JSON e passou a gerar os IDs no próprio código ([ADR-001](ADR%20001%20—%20Modelagem%20de%20dados.md), decisão 5).

A troca ficou restrita à pasta `data/`: os repositórios mantiveram as mesmas funções, e a lógica das telas, dos hooks e dos serviços não foi alterada (só dois comentários que citavam o SQLite), como previsto na [ADR-004](ADR%20004%20—%20Arquitetura%20em%20camadas.md). Se uma versão futura do Expo Go voltar a carregar o `expo-sqlite`, a volta também fica restrita a essa pasta.

## Consequências

- **Ganho:** A solução reduz consultas ao Firestore e permite buscas locais por parte do texto.
- **Ganho:** A fase local não usa nenhuma tecnologia que será jogada fora na Entrega 3.
- **Ganho:** O banco local funciona no Expo Go de Android e iOS sem nenhum módulo nativo extra.
- **Custo:** Existem duas cópias dos dados, sendo necessário mantê-las sincronizadas.
- **Custo:** A cópia local pode ficar temporariamente desatualizada até a próxima sincronização.
- **Custo:** Sem conexão, o usuário consegue consultar, mas não registrar retiradas ou cadastros.
- **Custo:** Todos os dados ficam na memória, e cada alteração regrava o arquivo inteiro. Para o volume de um laboratório (centenas de registros), isso leva poucos milissegundos, mas não serviria para dezenas de milhares de itens.
- **Custo:** Sem SQL, os filtros e as regras de integridade (e-mail único, saldo nunca negativo, histórico imutável) são garantidos pelo código dos repositórios e serviços, e não por restrições do banco.
