# Diário de Bordo de Uso de IA

| Etapa | Registros |
|---|---|
| Entrega 1 — Tema, PRD, ADRs e protótipo | [01 a 05](#registro-01--definição-do-problema-e-público-alvo) |
| Entrega 2 — Revisão dos documentos e implementação das telas | [06 a 15](#entrega-2) |

---

## Registro 01 — Definição do problema e público-alvo

### O que foi pedido à IA

Foi solicitado auxílio para definir o problema, o público-alvo e as principais necessidades de um aplicativo de inventário para laboratórios.

### O que veio da IA

A IA sugeriu um sistema voltado ao controle de materiais e equipamentos de laboratório, incluindo localização dos itens, validade, empréstimos, movimentações e busca.

Também foram sugeridos como usuários técnicos de laboratório, professores responsáveis e estudantes de iniciação científica.

### O que foi aceito

Foram aceitas as ideias relacionadas a:

- controle da localização dos itens;
- controle de validade;
- registro de empréstimos e devoluções;
- histórico de movimentações;
- busca de itens;
- técnicos, professores e estudantes como público-alvo.

### O que foi recusado ou alterado

Algumas sugestões foram adaptadas para representar melhor a realidade do projeto e limitar o escopo da aplicação.

### Por quê

A equipe decidiu manter somente funcionalidades compatíveis com o tempo disponível e com os requisitos da atividade.

---

## Registro 02 — Definição dos requisitos do sistema

### O que foi pedido à IA

Foi solicitado auxílio para estruturar os requisitos funcionais e não funcionais do aplicativo em formato de PRD.

### O que veio da IA

A IA sugeriu requisitos relacionados a:

- autenticação;
- cadastro de usuários;
- cadastro de itens;
- pesquisa;
- empréstimos;
- devoluções;
- controle de validade;
- histórico de movimentações;
- persistência dos dados;
- uso de inteligência artificial para leitura de rótulos.

### O que foi aceito

Foram aproveitados os requisitos relacionados às funcionalidades previstas no projeto.

Também foi adotada a ideia de utilizar requisitos não funcionais mensuráveis, evitando descrições apenas subjetivas como "sistema rápido" ou "sistema seguro".

### O que foi recusado ou alterado

Funcionalidades que não eram necessárias para o escopo inicial foram retiradas ou deixadas como possibilidades futuras.

### Por quê

O objetivo foi evitar o crescimento desnecessário do escopo e manter o projeto compatível com os requisitos da disciplina.

---

## Registro 03 — Definição das decisões arquiteturais

### O que foi pedido à IA

Foi solicitado auxílio para identificar decisões arquiteturais necessárias para o sistema e estruturar os ADRs.

### O que veio da IA

Foram sugeridas decisões relacionadas a:

- modelagem dos dados;
- persistência local e remota;
- sincronização dos dados;
- arquitetura do sistema.

### O que foi aceito

As quatro decisões foram consideradas relevantes para o projeto.

A equipe decidiu registrar:

- ADR 001 — Modelagem dos dados
- ADR 002 — Persistência local e remota
- ADR 003 — Sincronização dos dados

Ainda está sendo decidido o **ADR 004 — Arquitetura do sistema**.

> **Atualização posterior:** decidido e registrado na [ADR-004 — Arquitetura em camadas](03-ADRs/ADR%20004%20—%20Arquitetura%20em%20camadas.md).

### O que foi recusado ou alterado

A IA apresentou outras possibilidades de decisões arquiteturais, mas elas não foram adicionadas ao conjunto principal de ADRs.

### Por quê

As decisões escolhidas representam problemas reais que precisam ser resolvidos no projeto e evitam criar ADRs apenas para aumentar a quantidade de documentos.

---

## Registro 04 — Modelagem dos dados

### O que foi pedido à IA

Foi solicitado auxílio para decidir como representar os principais dados do sistema.

### O que veio da IA

Foram apresentadas duas alternativas principais:

- concentrar os dados em uma única estrutura;
- separar os conceitos em entidades relacionadas.

A IA sugeriu entidades como **Usuário**, **Item**, **Empréstimo** e **Movimentação**, com relacionamentos através de identificadores.

### O que foi aceito

Foi aceita a separação dos principais conceitos em entidades relacionadas.

Exemplos:

| Campo de origem         | Referência   |
| ----------------------- | ------------ |
| `Empréstimo.itemId`     | `Item.id`    |
| `Empréstimo.usuarioId`  | `Usuário.id` |
| `Movimentação.itemId`   | `Item.id`    |

### O que foi recusado

A alternativa de manter todas as informações em uma única estrutura não foi escolhida.

### Por quê

A equipe considerou que essa alternativa poderia aumentar a duplicação de dados e dificultar a manutenção conforme o sistema crescesse.

---

## Registro 05 — Persistência dos dados

### O que foi pedido à IA

Foi solicitado auxílio para escolher uma estratégia de persistência considerando o uso do Expo Go, Firebase e a necessidade de armazenamento local.

### O que veio da IA

Foram comparadas três alternativas:

- somente Firestore;
- somente SQLite;
- Firestore + SQLite.

A IA sugeriu utilizar o Firestore como fonte oficial e o SQLite como cache local.

### O que foi aceito

Foi aceita a utilização de:

| Banco         | Papel                   |
| ------------- | ----------------------- |
| **Firestore** | Fonte oficial dos dados |
| **SQLite**    | Cache local             |

Também foi considerada adequada a utilização do `expo-sqlite` para o armazenamento local.

### O que foi recusado

A utilização exclusiva do SQLite foi recusada.

### Por quê

O SQLite sozinho não permite compartilhar os dados entre diferentes dispositivos e usuários.

A utilização exclusiva do Firestore também não foi escolhida porque o projeto possui necessidade de realizar buscas locais e reduzir consultas remotas desnecessárias.

---

# Entrega 2

Ferramenta utilizada nesta etapa: **Claude (Anthropic)**.

---

## Registro 06 — Alterações no PRD

### O que foi pedido à IA

A equipe solicitou à IA as seguintes alterações no PRD:

- incluir uma **API externa**, exigida pelo enunciado, apresentando opções;
- substituir o RNF11 ("sessão encerrada após 30 min") por **sessão persistente**, exigida pelo enunciado;
- deixar claro no RF11 que "arquivar" é a **exclusão disponível na interface**;
- ajustar as metas que o grupo não consegue verificar: 10.000 itens (RNF01), 50 usuários simultâneos (RNF05) e 70% de cobertura de testes (RNF27);
- padronizar o nome do app, que aparecia como "Inventário do Laboratório" no PRD e "LabSto" no protótipo;
- acrescentar as telas de **lista do inventário** e **detalhe do item**, com rotas e parâmetros;
- remover o RF10 (código de barras) e o fluxo de aprovação de contas do RF05, mantendo a notificação local (RF20) e a exportação CSV (RF25).

### O que veio da IA

A IA aplicou as alterações e criou no PRD uma seção de mapa de telas (seção 9) e um histórico de revisões. Para os requisitos não-funcionais, ofereceu duas opções: ajustar para metas testáveis ou manter o texto e marcá-los como "metas futuras". Para a API externa, sugeriu PubChem ou BrasilAPI (feriados).

### O que foi aceito

- Ajustar os RNFs para metas testáveis com os recursos do grupo.
- Padronizar o nome como **LabSto — Inventário do Laboratório**.
- Tratar "arquivar" como a exclusão da interface (exclusão lógica).
- Acrescentar ao PRD as telas que faltavam, com rotas e parâmetros (seção 9).
- Adotar a **PubChem** como API externa.

### O que foi recusado ou alterado

- A opção de manter os RNFs como "metas futuras" foi recusada.
- A BrasilAPI não foi escolhida.

### Por quê

Metas marcadas como "futuras" continuariam sem poder ser demonstradas; metas menores e verificáveis podem ser mostradas na apresentação. A PubChem é mais útil no fluxo do laboratório do que um aviso de feriado. O código de barras foi cortado para concentrar o tempo nos requisitos obrigatórios da disciplina.

---

## Registro 07 — Revisão das ADR-001 (modelagem) e ADR-002 (persistência)

### O que foi pedido à IA

A equipe solicitou à IA que detalhasse as ADR-001 e ADR-002, que estavam genéricas, informando o que cada uma deveria passar a registrar:

- **ADR-001 — Modelagem dos dados:** as coleções do Firestore (usuários, locais, itens, empréstimos e movimentações), com os campos de cada uma, e um exemplo em JSON de um item cadastrado;
- **ADR-002 — Persistência local e remota:** como a persistência funciona enquanto o app usa só o banco local e o que muda na Entrega 3, quando o Firestore entra.

### O que veio da IA

A IA reescreveu as duas ADRs e deu algumas dicas pelo caminho, que foram incorporadas ao texto:

- **copiar o nome do item, do usuário e do local** nos empréstimos e movimentações (desnormalização), porque o Firestore não faz JOIN e cada documento extra lido para montar o histórico gasta cota gratuita;
- usar **coleções na raiz** em vez de subcoleções, para o painel conseguir listar as movimentações recentes de todos os itens com uma única consulta;
- **guardar o saldo no próprio item** e atualizá-lo na mesma transação que grava o empréstimo e a movimentação;
- **gerar os IDs no app** (UUID), para usar o mesmo ID no SQLite e no Firestore;
- **guardar a validade como texto** `AAAA-MM-DD`, porque uma data guardada como objeto pode aparecer um dia antes por causa do fuso horário;
- **não guardar o status do item** ("vencido", "emprestado"), calculando-o a partir dos dados, para que nunca fique desatualizado;
- registrar na ADR-002 que o Firestore **não faz busca por parte do texto** ("etan" → "Etanol"), o que reforça o uso do SQLite;
- controlar a versão do banco local com `PRAGMA user_version`, para alterar tabelas sem apagar os dados do aparelho.

### O que foi aceito

As duas ADRs revisadas e todas as dicas acima. A ADR-001 ganhou também um diagrama das coleções.

### O que foi recusado ou alterado

As alternativas registradas nas ADRs não foram escolhidas:

- guardar tudo em uma única estrutura (item com empréstimos e movimentações dentro);
- entidades totalmente normalizadas, só com IDs, sem cópia de nomes;
- subcoleções dentro de cada item;
- usar AsyncStorage como banco local.

### Por quê

As versões anteriores diziam quais entidades existiam, mas não como seriam gravadas. Com as coleções e os campos definidos, a equipe consegue implementar o SQLite desde já com a mesma estrutura que será usada no Firestore na Entrega 3, sem retrabalho. O AsyncStorage foi descartado porque só guarda pares chave/valor: buscar e filtrar itens exigiria carregar tudo na memória.

---

## Registro 08 — Falhas encontradas na ADR-003 (sincronização)

### O que foi pedido à IA

Durante as alterações dos documentos, foi pedido que a IA verificasse se a estratégia de sincronização incremental funcionaria em todos os casos.

### O que veio da IA

A IA apontou duas falhas na estratégia original:

1. a consulta `updatedAt > lastSyncAt` **não detecta exclusões**, porque um documento apagado não aparece em nenhuma consulta;
2. se o `updatedAt` fosse gerado pelo relógio do celular, um aparelho com o relógio atrasado poderia ter alterações que nunca seriam baixadas pelos outros.

Sugeriu exclusão lógica (`arquivado: true`), `serverTimestamp()` do Firebase e a comparação com `>=` em vez de `>`, com gravação por *upsert*, para não perder documentos gravados no mesmo instante do último sincronismo.

### O que foi aceito

As três correções. A ADR-003 foi revisada, e a ADR-001 passou a usar exclusão lógica também nos locais.

### O que foi recusado ou alterado

Nada foi recusado.

### Por quê

Sem as correções, a sincronização deixaria itens excluídos aparecendo em outros aparelhos, um defeito difícil de perceber em testes com um único celular.

---

## Registro 09 — Criação das ADR-004 (arquitetura) e ADR-005 (navegação)

### O que foi pedido à IA

A equipe solicitou à IA que escrevesse duas novas ADRs, informando quais decisões cada uma deveria registrar:

- **ADR-004 — Arquitetura em camadas:** o app organizado em telas, hooks, serviços e repositórios, com estado global apenas para a sessão do usuário (React Context), sem biblioteca de estado como Redux;
- **ADR-005 — Navegação e rotas protegidas:** uso do Expo Router, com telas públicas (login e cadastro) separadas das telas privadas.

A equipe também informou as tecnologias já definidas (Expo Router, `expo-sqlite`, JavaScript) e pediu que as ADRs seguissem o mesmo formato das anteriores: resumo, contexto, alternativas consideradas, solução e consequências.

### O que veio da IA

A IA escreveu as duas ADRs e deu algumas dicas pelo caminho, que foram incorporadas ao texto:

- criar um **componente único** (`EstadoLista`) para os estados de carregamento, vazio e erro, usado em todas as listagens, para que nenhuma lista fique sem esses estados (RNF29);
- fazer a proteção das telas privadas em **um único layout** do grupo `(app)`, em vez de verificar a sessão em cada tela;
- lembrar que esconder telas na navegação não protege os dados: a proteção real fica nas **Security Rules** do Firestore;
- passar como parâmetro de rota **apenas IDs e filtros**, nunca o objeto inteiro, para que a tela de destino sempre busque o dado atualizado;
- usar `useFocusEffect` para **recarregar a tela ao voltar**, por exemplo do registro de uma retirada para o detalhe do item;
- definir a regra de tratamento de erros: o erro nasce na camada que tem a informação e sobe até a tela que sabe exibi-lo;
- incluir uma tabela mostrando **o que muda em cada camada quando o Firestore e a autenticação entrarem, na Entrega 3**.

### O que foi aceito

As duas ADRs e todas as dicas acima.

### O que foi recusado ou alterado

As alternativas registradas nas ADRs não foram escolhidas:

- acessar o banco diretamente das telas;
- usar Redux ou Zustand para o estado global;
- configurar a navegação manualmente com React Navigation;
- verificar a sessão em cada tela.

### Por quê

Com as camadas, a troca do SQLite pelo Firestore na Entrega 3 fica restrita aos repositórios e à sessão, sem reescrever as telas. As dicas da IA resolvem exigências do enunciado (estados de listagem, telas privadas protegidas, passagem de parâmetros) na estrutura do código, em vez de depender de cada integrante lembrar delas ao escrever uma tela.

---

## Registro 10 — Onde guardar a chave do Gemini: servidor no Render

### O que foi pedido à IA

Foi solicitado que a IA explicasse como guardar a chave do Gemini sem violar a regra de "nenhuma chave de API versionada no repositório".

Depois da primeira resposta, a equipe perguntou à IA se a chave **poderia ficar guardada em um servidor no Render**, em vez de ficar no app.

### O que veio da IA

Na primeira resposta, a IA propôs guardar a chave em `EXPO_PUBLIC_GEMINI_KEY` no `.env` (fora do Git) e **registrar em ADR o risco** de a chave ser embutida no app, porque variáveis `EXPO_PUBLIC_` são copiadas para dentro do código do app. Também listou as alternativas Cloud Functions (exige plano pago) e Firebase AI Logic (depende de App Check, que não funciona no Expo Go).

Sobre a proposta do Render, a IA confirmou que é possível e explicou como funcionaria: o app chama um servidor pequeno no Render, e **só esse servidor conhece a chave**, guardada nas variáveis de ambiente do painel do Render. A IA apontou, porém, que um servidor aceitando qualquer requisição só mudaria o problema de lugar, porque o endereço do servidor também fica no app. Sugeriu que o servidor **exigisse o token do Firebase Authentication** do usuário logado e limitasse o número de extrações por usuário por dia. Também listou os custos: o servidor "dorme" após 15 minutos sem uso no plano gratuito, e a primeira chamada depois disso pode levar até cerca de 1 minuto.

### O que foi aceito

- A chave do Gemini fica guardada **somente no Render**, como variável de ambiente (`GEMINI_API_KEY`). Ela não fica no repositório nem no app.
- O servidor no Render só atende usuários com **token válido do Firebase Authentication**, com limite de 30 extrações por usuário por dia (RNF31).
- O app guarda apenas o endereço do servidor (`EXPO_PUBLIC_IA_URL`), que não é segredo.
- A decisão foi registrada na ADR-006.

### O que foi recusado ou alterado

- A **proposta inicial da IA** (chave no app, com o risco registrado em ADR) foi recusada.
- Cloud Functions e Firebase AI Logic também foram recusados.

### Por quê

Aceitar o risco de a chave ser extraída do app era desnecessário, já que o Render oferece uma alternativa gratuita que elimina a exposição. O custo assumido (servidor lento na primeira chamada após inatividade) é tratado com indicação de progresso e opção de seguir no cadastro manual.

---

## Registro 11 — Busca na PubChem por número CAS

### O que foi pedido à IA

Foi solicitado que a IA detalhasse a integração com a PubChem.

### O que veio da IA

A IA alertou que a PubChem indexa nomes em **inglês**: uma busca por "Acetona" pode não encontrar o composto, mas o número CAS (`67-64-1`) sempre encontra. Sugeriu acrescentar o campo **CAS** ao cadastro e à extração por IA, guardar as respostas em cache local e usar a PubChem só para reagentes.

### O que foi aceito

O campo CAS (RF07, RF08), a busca por CAS com fallback por nome, o cache local e a tradução dos pictogramas GHS para português (ADR-007).

### O que foi recusado ou alterado

A IA também listou a possibilidade de pedir ao Gemini os dados de segurança do reagente. Essa opção foi recusada.

### Por quê

Para informação de perigo químico, a fonte precisa ser uma base oficial; uma LLM pode inventar dados.

---

## Registro 12 — Cadastro sem escolha de perfil

### O que foi pedido à IA

A equipe percebeu que o protótipo permitia **escolher o perfil no formulário de cadastro**, o que deixaria qualquer pessoa se cadastrar como Administrador. Foi solicitado que a IA alterasse o cadastro para que a pessoa **não pudesse escolher o perfil** e propusesse como os perfis passariam a ser atribuídos.

### O que veio da IA

A IA retirou o campo de perfil do cadastro (RF02 e US02) e propôs três formas de atribuir os perfis: toda conta nova como Estudante, com promoção pelo Administrador; código de convite por perfil; ou aprovação de toda conta nova pelo Administrador. Também sugeriu que a regra fosse garantida pelas Security Rules do Firestore, e não só pela interface.

### O que foi aceito

Cadastro sempre como Estudante, com o Administrador alterando perfis em uma lista de usuários, e a regra reforçada nas Security Rules (ADR-008). O RF05 foi reescrito e passou a ser obrigatório.

### O que foi recusado ou alterado

O código de convite e o fluxo de aprovação de toda conta nova foram recusados.

### Por quê

Os dois exigiriam telas e estados a mais. Como a maioria dos usuários são estudantes, eles podem usar o app logo após o cadastro, e só técnicos precisam ser promovidos.

---

## Registro 13 — Verificação de erros e incongruências nos documentos

### O que foi pedido à IA

Antes de enviar os documentos, a equipe solicitou à IA duas verificações completas do README, do PRD, das ADRs e deste diário: a primeira procurando **erros**, e a segunda procurando **incongruências** entre um documento e outro.

### O que veio da IA

A IA conferiu os links, a numeração dos requisitos e das ADRs e os valores repetidos em mais de um documento, e encontrou problemas **em textos que ela mesma tinha escrito** nas etapas anteriores.

Na verificação de erros:

- a **ADR-001** explicava ao contrário o problema de fuso horário da validade (o correto: `new Date('2026-11-03')` é lido como meia-noite em UTC, que em Brasília é 21h do dia 02/11);
- o **README** citava um nome de disciplina que não foi informado pela equipe;
- a tabela da **ADR-004** dizia que, na Entrega 3, as telas só mudariam no resultado da IA, esquecendo PubChem, notificação e exportação;
- a **ADR-007** afirmava que a busca pelo CAS "sempre" encontra o composto;
- um bloco de código quebrava a numeração da lista na **ADR-003**;
- o Registro 08 deste diário ainda falava em "revisão" depois que o Registro 06 foi alterado.

Na verificação de incongruências:

- o **RNF26** exigia que "um usuário novo" cadastrasse um item, mas toda conta nova é Estudante, e Estudante não pode cadastrar itens (ADR-008);
- o **RNF15** dizia "0 chaves embutidas no app", mas a configuração do Firebase, que vai no app, contém um campo `apiKey`;
- a **ADR-005** só protegia a tela de Usuários, embora a matriz de permissões também restrinja o cadastro e a edição de itens e locais;
- a **ADR-008** dizia que a criação do primeiro Administrador estava documentada no README, e não estava.

### O que foi aceito

Todas as correções:

- RNF26 passou a se referir a um técnico usando o app pela primeira vez;
- RNF15 passou a falar em chaves **secretas**, explicando que a configuração do Firebase não é segredo (o acesso é controlado pelas Security Rules);
- ADR-005 passou a listar todas as telas e ações restritas por perfil;
- o README ganhou o passo a passo para criar o primeiro Administrador;
- os demais erros foram corrigidos nos respectivos documentos, e as mudanças no PRD entraram no histórico de revisões.

A IA também alertou que o README indicava a entrega como concluída antes de o código existir. A situação foi alterada para "em andamento".

### O que foi recusado ou alterado

Nada foi recusado.

### Por quê

Os erros estavam em textos gerados pela própria IA, alguns em pontos que o professor pode perguntar na apresentação (como a chave do Firebase no app). Isso mostra que o conteúdo gerado precisa ser conferido antes da entrega, e a equipe passou a pedir uma verificação cruzada sempre que vários documentos são alterados juntos.

---

## Registro 14 — Codificação das telas a partir dos documentos

### O que foi pedido à IA

A equipe solicitou à IA que codificasse as telas usando os documentos do repositório como especificação:

- telas, rotas e parâmetros da seção 9 do PRD e da ADR-005;
- coleções e campos da ADR-001, gravados no SQLite (ADR-002);
- arquitetura em camadas da ADR-004;
- regra de perfis da ADR-008 e matriz de permissões do PRD;
- usuários e dados de exemplo descritos no README.

### O que veio da IA

A IA criou o projeto com o Expo SDK 58 e implementou as 13 telas, a camada de dados com uma tabela por coleção, as regras de negócio nos serviços, os hooks com os estados de carregamento, vazio e erro, e a sessão no `AuthContext`.

Antes de escrever o código, a IA conferiu as funções nos pacotes instalados, porque o SDK 58 é mais novo do que o conhecimento dela. Duas mudanças apareceram: o componente de abas passou a ser importado de `expo-router/js-tabs`, e o `SafeAreaView` do React Native foi descontinuado.

A IA também sugeriu alguns detalhes que não estavam nos documentos:

- bloquear no próprio banco (com *triggers* do SQLite) qualquer alteração ou exclusão do histórico, além das Security Rules previstas para a Entrega 3 (RNF20);
- impedir a exclusão de um item com empréstimo em aberto;
- atalhos de data na retirada ("+7 dias") e quantidade padrão 1, deixando a retirada em 2 toques a partir do detalhe do item (RNF25);
- uma ferramenta "Simular erro nas listagens" no Perfil, para mostrar o estado de erro na apresentação;
- uma conta de exemplo desativada, para demonstrar o bloqueio de login (US12).

### O que foi aceito

O código e os detalhes acima. O README, o PRD (seção 9) e as ADR-002 e ADR-005 foram atualizados com o que a implementação acrescentou.

### O que foi recusado ou alterado

Nada foi recusado.

### Por quê

Usar os documentos como especificação manteve o código coerente com o que foi decidido nas ADRs. A conferência das funções nos pacotes instalados evitou código baseado em versões antigas do Expo, que não funcionaria no Expo Go atual.

---

## Registro 15 — Erro ao abrir o app no Expo Go do celular

### O que foi pedido à IA

Ao rodar o app pela primeira vez num celular Android com o Expo Go 58, ele fechou na abertura com o erro `Cannot find native module 'ExpoSQLite'`. A equipe enviou o erro à IA e solicitou que encontrasse a causa e fizesse o app abrir no Expo Go, sem trocar a versão do SDK.

Antes disso, o comando `npx expo start --tunnel` também tinha falhado, pedindo login numa conta Expo.

### O que veio da IA

A IA verificou que o erro não vinha do computador da equipe: essa versão do Expo Go para Android não carrega o módulo nativo do `expo-sqlite`, e outro projeto público no GitHub registrou o mesmo erro com o Expo Go 58.0.5. Nos registros de alterações dos pacotes instalados, a IA viu que só dois pacotes do projeto passaram por uma mudança interna do Expo (a nova versão da API de módulos nativos): o `expo-sqlite` e o `expo-crypto`, usado para gerar os IDs.

A IA apresentou três caminhos:

1. voltar ao SDK 57, descartado porque o Expo Go da loja só abre projetos do SDK 58;
2. manter o SQLite e criar um banco reserva para quando o módulo faltar, descartado porque seriam dois bancos para manter;
3. trocar o banco local por um arquivo JSON gravado com o `expo-file-system`, que faz parte do próprio pacote `expo` e vem dentro do Expo Go.

Com o caminho 3, a IA reescreveu só a pasta `data/`: a leitura e a gravação do arquivo (com uma versão para o navegador, usando o `localStorage`), as transações (cópia dos dados antes da operação e restauração em caso de falha) e os repositórios, com as mesmas funções de antes. Os IDs passaram a ser gerados no próprio código, no mesmo formato UUID.

Para o túnel, a IA explicou que no SDK 58 o `--tunnel` usa o serviço do próprio Expo, que exige conta, e que `--tunnel ngrok` funciona sem conta.

Depois da troca, a IA repetiu os testes:

- 28 casos de regras de negócio, incluindo casos novos: o arquivo no disco acompanha os dados em memória, a transação desfeita não altera o arquivo, o histórico continua bloqueado para alteração e os IDs são únicos;
- uma simulação de fechar e abrir o app, em que os dados criados e a sessão continuam salvos, e uma simulação de arquivo corrompido, em que o app recria os dados de exemplo em vez de fechar;
- os dois roteiros no navegador (45 telas e estados), sem erros;
- o empacotamento para Android e iOS, conferindo que o app não usa mais os módulos `ExpoSQLite` e `ExpoCrypto`;
- a instalação a partir de um clone limpo.

Por fim, a equipe atualizou o projeto no computador (`git pull`, `npm install` e `npx expo start --clear`) e confirmou que o app abre e funciona no celular Android com o Expo Go 58.

### O que foi aceito

A troca do banco local e a revisão da ADR-002, que passou a registrar o SQLite como alternativa descartada, o motivo e os novos custos (todos os dados ficam em memória e cada alteração regrava o arquivo inteiro). As ADR-001, 003, 004, 005 e 007 tiveram só a nomenclatura ajustada, e o README passou a indicar `npx expo start --tunnel ngrok`.

### O que foi recusado ou alterado

Duas afirmações anteriores da IA estavam erradas e foram corrigidas: que o modo túnel não exigia conta e que o app estava pronto para o Expo Go. A IA tinha testado o app no navegador e em empacotamentos, que não usam o Expo Go, e por isso o erro só apareceu no celular.

O motivo usado no Registro 07 para descartar o AsyncStorage (buscar e filtrar exigiria carregar tudo na memória) também foi revisto: o arquivo JSON também mantém os dados em memória, o que a equipe aceitou para o volume de um laboratório. Na ADR-002, o AsyncStorage continua descartado, agora porque guardaria o mesmo conteúdo e seria um pacote a mais.

### Por quê

O enunciado exige que o app rode no Expo Go, então nenhuma solução que dependesse do `expo-sqlite` funcionaria na correção. A troca também mostrou, na prática, o ganho da arquitetura em camadas da ADR-004: o banco mudou sem alterar a lógica das telas, dos hooks e dos serviços. A equipe passou a testar no celular antes de cada entrega, e não só no navegador.
