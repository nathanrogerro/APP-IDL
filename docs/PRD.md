# 🧪 Inventário do Laboratório — PRD

Documento de Requisitos do Produto (PRD) para um app de controle de inventário de laboratório com cadastro assistido por IA a partir da foto do rótulo.


---

## 📑 Sumário

1. [Visão geral](#1-visão-geral)
2. [Problema](#2-problema)
3. [Público-alvo](#3-público-alvo)
4. [Como resolvem hoje](#4-como-resolvem-hoje)
5. [Objetivos e métricas de sucesso](#5-objetivos-e-métricas-de-sucesso)
6. [Requisitos funcionais](#6-requisitos-funcionais)
7. [Requisitos não-funcionais](#7-requisitos-não-funcionais)
8. [Histórias de usuário](#8-histórias-de-usuário)
9. [Escopo e não escopo](#9-escopo-e-não-escopo)

---

## 1. Visão geral

Aplicativo mobile para cadastrar, localizar e controlar reagentes, vidraria e equipamentos de laboratório. O diferencial é o **cadastro a partir da foto do rótulo**: uma LLM lê a embalagem e **sugere** nome, concentração, fabricante e validade, que o usuário confere antes de salvar. A IA nunca grava dados sem confirmação humana.

---

## 2. Problema

- Reagentes **vencem no fundo do armário** sem que ninguém perceba.
- **Equipamentos emprestados** somem: não se sabe com quem estão nem quando voltam.
- Itens são **comprados em duplicidade** porque o existente estava em outra prateleira.
- O controle, quando existe, é **uma planilha que só uma pessoa atualiza** — se ela sai ou esquece, o inventário deixa de refletir a realidade.
- **Digitar item por item à mão** é tão trabalhoso que o inventário nunca sai do papel.

---

## 3. Público-alvo

| Persona | Quem é | O que precisa |
|---|---|---|
| **Técnico de laboratório** | Responsável pela organização diária | Cadastrar rápido, saber o que está vencendo, controlar empréstimos |
| **Professor responsável** | Coordena o laboratório e aprova compras | Visão geral do estoque, evitar compras duplicadas, rastrear responsáveis |
| **Estudante de iniciação científica** | Usa itens nos experimentos | Encontrar itens, registrar retirada e devolução sem burocracia |

---

## 4. Como resolvem hoje

| Solução atual | Limitação |
|---|---|
| Planilha (Excel / Google Sheets) mantida por uma pessoa | Desatualiza rápido; ponto único de falha; sem alertas |
| Caderno de empréstimos na bancada | Ilegível, sem data prevista de devolução, sem busca |
| Etiquetas e memória ("acho que tem no armário 3") | Não escala; se perde quando a pessoa sai |
| Inventário anual manual | Feito uma vez por ano; descobre o vencido só depois de vencer |
| Sistemas patrimoniais da instituição | Focados em patrimônio, não em consumíveis nem validade |

---

## 5. Objetivos e métricas de sucesso

| Objetivo | Métrica | Meta |
|---|---|---|
| Reduzir perda por vencimento | Itens descartados vencidos sem alerta prévio | 0 após 3 meses de uso |
| Acelerar cadastro | Tempo médio para cadastrar um item com foto | ≤ 30 s |
| Rastrear empréstimos | Retiradas com responsável e data prevista registrados | 100% |
| Evitar compra duplicada | Buscas que encontram o item antes da compra | ≥ 90% dos casos auditados |
| Adoção | Usuários ativos semanais / usuários cadastrados | ≥ 60% |

---

## 6. Requisitos funcionais

**Prioridade:** 🔴 Must (obrigatório no MVP) · 🟡 Should (desejável) · 🟢 Could (se sobrar tempo)

### 6.1 Autenticação e usuários

| ID | Requisito | Prioridade |
|---|---|---|
| RF01 | O sistema deve permitir **login** com e-mail e senha. | 🔴 |
| RF02 | O sistema deve permitir **cadastro de usuário** com nome, e-mail, senha e perfil. | 🔴 |
| RF03 | O sistema deve permitir **recuperação de senha** por link enviado ao e-mail. | 🟡 |
| RF04 | O sistema deve ter **três perfis**: Administrador (professor), Técnico e Estudante, com permissões distintas (ver [matriz](#matriz-de-permissões)). | 🔴 |
| RF05 | O Administrador deve poder **aprovar, editar e desativar** usuários. | 🟡 |
| RF06 | O sistema deve permitir **logout**. | 🔴 |

### 6.2 Cadastro de itens no inventário

| ID | Requisito | Prioridade |
|---|---|---|
| RF07 | O sistema deve permitir **cadastrar item** com: tipo (reagente, vidraria, equipamento), nome, quantidade, unidade, localização (sala, armário, prateleira), fabricante, lote, validade e observações. | 🔴 |
| RF08 | O sistema deve permitir **tirar foto do rótulo** e enviar à LLM para extrair nome, concentração, fabricante e validade. A foto é usada só na extração e **não é armazenada**. | 🔴 |
| RF09 | Campos preenchidos pela IA devem aparecer **destacados como sugestão** e só são salvos após confirmação do usuário. | 🔴 |
| RF10 | O sistema deve permitir **ler código de barras** para preencher ou localizar um item. | 🟡 |
| RF11 | O sistema deve permitir **editar** e **arquivar** itens (sem exclusão física). | 🔴 |
| RF12 | O sistema deve permitir **cadastrar locais** (sala → armário → prateleira). | 🔴 |
| RF13 | O sistema deve **avisar possível duplicidade** ao cadastrar item com nome e fabricante já existentes. | 🟡 |

### 6.3 Retirada e devolução

| ID | Requisito | Prioridade |
|---|---|---|
| RF14 | O sistema deve registrar **retirada** com item, quantidade, responsável e data prevista de devolução. | 🔴 |
| RF15 | O sistema deve registrar **devolução**, atualizando quantidade e status. | 🔴 |
| RF16 | O sistema deve registrar **consumo** de reagentes (baixa sem devolução). | 🔴 |
| RF17 | O sistema deve listar **empréstimos atrasados** em destaque. | 🟡 |

### 6.4 Validade e alertas

| ID | Requisito | Prioridade |
|---|---|---|
| RF18 | O sistema deve **alertar** sobre itens com vencimento próximo (prazo configurável). | 🔴 |
| RF19 | O sistema deve **marcar como vencidos** itens com validade ultrapassada. | 🔴 |
| RF20 | O sistema deve enviar **notificação push** de vencimento e de devolução atrasada. | 🟡 |
| RF21 | O sistema deve alertar quando a quantidade ficar **abaixo do estoque mínimo** definido. | 🟢 |

### 6.5 Busca e histórico

| ID | Requisito | Prioridade |
|---|---|---|
| RF22 | O sistema deve permitir **buscar** por nome, tipo e localização física, com filtros combináveis. | 🔴 |
| RF23 | O sistema deve exibir o **histórico de movimentação** de cada item (cadastro, edição, retirada, devolução, consumo), com usuário e data/hora. | 🔴 |
| RF24 | O sistema deve exibir um **painel** com totais: itens, vencendo, vencidos, emprestados, atrasados. | 🟡 |
| RF25 | O sistema deve **exportar** o inventário em CSV. | 🟢 |

### Matriz de permissões

| Ação | Administrador | Técnico | Estudante |
|---|:---:|:---:|:---:|
| Gerenciar usuários | ✅ | ❌ | ❌ |
| Cadastrar / editar / arquivar item | ✅ | ✅ | ❌ |
| Cadastrar locais | ✅ | ✅ | ❌ |
| Registrar retirada / devolução / consumo | ✅ | ✅ | ✅ |
| Buscar e ver histórico | ✅ | ✅ | ✅ |
| Exportar CSV | ✅ | ✅ | ❌ |

---

## 7. Requisitos não-funcionais


### Desempenho

| ID | Requisito |
|---|---|
| RNF01 | A busca deve retornar resultados em **≤ 1 s** (p95) com base de **10.000 itens**. |
| RNF02 | A extração de dados do rótulo pela IA deve responder em **≤ 8 s** (p95). |
| RNF03 | A leitura de código de barras deve reconhecer o código em **≤ 2 s** em iluminação ≥ 300 lux. |
| RNF04 | Telas devem carregar em **≤ 2 s** em conexão 4G (≥ 5 Mbps). |
| RNF05 | O sistema deve suportar **50 usuários simultâneos** sem ultrapassar os tempos acima. |

### Qualidade da IA

| ID | Requisito |
|---|---|
| RNF06 | A IA deve acertar **≥ 85%** dos campos extraídos em conjunto de teste de **100 rótulos** reais. |
| RNF07 | **100%** dos campos sugeridos pela IA devem exigir confirmação antes de salvar (0 gravações automáticas). |
| RNF08 | Imagens enviadas à IA devem ser comprimidas para **≤ 500 KB** (lado maior ≤ 1.600 px). |

### Segurança e privacidade

| ID | Requisito |
|---|---|
| RNF09 | Senhas com mínimo de **8 caracteres**, incluindo **1 número** e **1 letra** (política de senha do Firebase Authentication). |
| RNF10 | **0 senhas** gravadas no Firestore ou no aparelho: autenticação e hash ficam 100% no Firebase Authentication. |
| RNF11 | Sessão encerrada após **30 min** de inatividade no app. |
| RNF12 | **100%** do tráfego via **HTTPS (TLS 1.2+)**. |
| RNF13 | **100%** das coleções do Firestore protegidas por Security Rules que aplicam a matriz de permissões; **0 regras** `allow read, write: if true`. |
| RNF14 | Link de recuperação de senha expira em **1 h**. |
| RNF15 | **0 chaves de API** versionadas no repositório (chaves em variáveis de ambiente / `.env` no `.gitignore`). |

### Disponibilidade e dados

| ID | Requisito |
|---|---|
| RNF16 | Disponibilidade mensal de **≥ 99%** (máx. ~7 h fora do ar por mês). |
| RNF17 | Exportação do inventário em JSON **1 vez por semana**, mantendo as **4 últimas** cópias (backups agendados do Firestore exigem plano pago). |
| RNF18 | Operar dentro da cota gratuita do Firestore: **≤ 50.000 leituras** e **≤ 20.000 gravações** por dia, com listas paginadas em **20 itens** por página. |
| RNF19 | **0 bytes** gravados em Cloud Storage no MVP (o Storage exige plano Blaze). |
| RNF20 | Histórico de movimentação retido por **≥ 5 anos**. |
| RNF21 | Alerta padrão de vencimento **30 dias** antes, configurável entre **7 e 180 dias**. |

### Compatibilidade e usabilidade

| ID | Requisito |
|---|---|
| RNF22 | Funcionar em **Android 10+** e **iOS 15+**. |
| RNF23 | Contraste de texto **≥ 4,5:1** (WCAG AA). |
| RNF24 | Áreas de toque com **≥ 48 × 48 dp**. |
| RNF25 | Registrar uma retirada em **≤ 4 toques** a partir da tela do item. |
| RNF26 | Um usuário novo deve cadastrar o primeiro item em **≤ 2 min** sem treinamento (teste com **5 usuários**). |

### Manutenibilidade

| ID | Requisito |
|---|---|
| RNF27 | Cobertura de testes automatizados **≥ 70%** nas regras de negócio. |
| RNF28 | Nova versão testável em **≤ 15 min** via Expo Go ou build do EAS. |

---

## 8. Histórias de usuário

### US01 — Login
**Como** usuário cadastrado, **quero** entrar com e-mail e senha **para** acessar o inventário do meu laboratório.

**Critérios de aceite**
- [ ] **Dado** e-mail e senha corretos, **quando** toco em "Entrar", **então** vejo a tela inicial em ≤ 2 s.
- [ ] **Dado** senha incorreta, **quando** tento entrar, **então** vejo "E-mail ou senha inválidos" (sem indicar qual está errado).
- [ ] **Dado** 5 tentativas falhas, **quando** tento a 6ª, **então** a conta fica bloqueada por 15 min.

---

### US02 — Cadastro de usuário
**Como** novo membro do laboratório, **quero** criar minha conta **para** registrar retiradas no meu nome.

**Critérios de aceite**
- [ ] **Dado** nome, e-mail válido e senha dentro da regra, **quando** envio o cadastro, **então** a conta é criada com perfil Estudante aguardando aprovação.
- [ ] **Dado** e-mail já cadastrado, **quando** envio, **então** vejo "E-mail já em uso".
- [ ] **Dado** senha com menos de 8 caracteres, **quando** envio, **então** o botão fica bloqueado e a regra é exibida.

---

### US03 — Cadastro de item com foto do rótulo
**Como** técnico, **quero** fotografar o rótulo de um reagente **para** não digitar os dados à mão.

**Critérios de aceite**
- [ ] **Dado** que tirei a foto, **quando** a IA responde, **então** nome, concentração, fabricante e validade aparecem preenchidos e **destacados como sugestão**.
- [ ] **Dado** campos sugeridos, **quando** não confirmo, **então** o item **não** é salvo.
- [ ] **Dado** que a IA não conseguiu ler um campo, **quando** a resposta chega, **então** o campo fica vazio (nunca inventado) e sinalizado.
- [ ] **Dado** falha ou tempo > 8 s, **quando** ocorre, **então** posso seguir com cadastro manual sem perder a foto.
- [ ] **Dado** item salvo, **quando** abro o histórico, **então** consta "cadastrado (sugestão IA confirmada)" com meu nome e data/hora.

---

### US04 — Cadastro manual de item
**Como** técnico, **quero** cadastrar vidraria e equipamentos sem foto **para** registrar itens sem rótulo.

**Critérios de aceite**
- [ ] **Dado** tipo, nome, quantidade e localização preenchidos, **quando** salvo, **então** o item aparece na busca imediatamente.
- [ ] **Dado** que falta um campo obrigatório, **quando** tento salvar, **então** o campo é destacado com mensagem.
- [ ] **Dado** nome e fabricante iguais a um item existente, **quando** salvo, **então** vejo aviso de possível duplicidade com link para o item.

---

### US05 — Retirada de item
**Como** estudante, **quero** registrar que peguei um equipamento **para** que saibam com quem ele está.

**Critérios de aceite**
- [ ] **Dado** um item disponível, **quando** registro retirada com data prevista, **então** o status muda para "Emprestado" com meu nome.
- [ ] **Dado** quantidade maior que a disponível, **quando** confirmo, **então** o sistema bloqueia e mostra o saldo.
- [ ] **Dado** data prevista no passado, **quando** confirmo, **então** o sistema não aceita.

---

### US06 — Devolução de item
**Como** estudante, **quero** registrar a devolução **para** encerrar minha responsabilidade sobre o item.

**Critérios de aceite**
- [ ] **Dado** um empréstimo aberto em meu nome, **quando** registro a devolução, **então** o status volta a "Disponível" e a quantidade é restaurada.
- [ ] **Dado** devolução após a data prevista, **quando** registro, **então** o histórico marca "devolvido com atraso de N dias".

---

### US07 — Alerta de validade
**Como** técnico, **quero** ser avisado antes de um reagente vencer **para** usá-lo ou planejar a reposição.

**Critérios de aceite**
- [ ] **Dado** item com validade em ≤ 30 dias (padrão), **quando** abro o app, **então** ele aparece na lista "Vencendo".
- [ ] **Dado** item com validade ultrapassada, **quando** abro o app, **então** ele aparece como "Vencido" em vermelho.
- [ ] **Dado** que alterei o prazo para 60 dias, **quando** salvo, **então** a lista "Vencendo" é recalculada.
- [ ] **Dado** notificações ativas, **quando** um item entra na janela de alerta, **então** recebo 1 push por dia com o resumo (não 1 por item).

---

### US08 — Busca
**Como** professor, **quero** buscar um reagente antes de comprar **para** não comprar algo que já temos.

**Critérios de aceite**
- [ ] **Dado** um termo parcial ("etan"), **quando** busco, **então** vejo itens que contêm o termo (ex.: "Etanol 70%") em ≤ 1 s.
- [ ] **Dado** filtros de tipo e sala, **quando** aplico, **então** apenas itens que atendem a todos os filtros aparecem.
- [ ] **Dado** nenhum resultado, **quando** busco, **então** vejo "Nenhum item encontrado" e opção de cadastrar.

---

### US09 — Histórico de movimentação
**Como** professor, **quero** ver o histórico de um item **para** saber quem o usou por último.

**Critérios de aceite**
- [ ] **Dado** um item, **quando** abro o histórico, **então** vejo todas as movimentações em ordem decrescente com tipo, usuário, quantidade e data/hora.
- [ ] **Dado** qualquer perfil, **quando** tento editar ou apagar uma entrada do histórico, **então** a ação não existe (histórico é imutável).

---

## 9. Escopo e não escopo

### ✅ Escopo (MVP)
- Login, cadastro de usuário, logout e três perfis de acesso
- Cadastro de itens (reagentes, vidraria, equipamentos) com quantidade e localização
- Cadastro assistido por IA a partir da foto do rótulo, **sempre com confirmação**
- Cadastro de locais (sala → armário → prateleira)
- Registro de retirada, devolução e consumo
- Controle de validade com alertas no app
- Busca por nome, tipo e localização
- Histórico de movimentação por item
- **Um laboratório** por instalação

### ❌ Não escopo (fora do MVP)
- Compras, orçamentos e integração com fornecedores
- Integração com o sistema patrimonial da instituição
- Múltiplos laboratórios / instituições na mesma conta
- Fichas de segurança (FISPQ/FDS) e regras de compatibilidade química
- Controle de reagentes controlados (Polícia Federal / Exército)
- Versão web e modo offline completo
- Geração e impressão de etiquetas com código de barras
- Agendamento de uso de equipamentos
- Relatórios avançados e dashboards analíticos
