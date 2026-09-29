# Diário de Bordo de Uso de IA

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
