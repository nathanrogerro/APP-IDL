# LabSto — Inventário do Laboratório · PRD

Documento de Requisitos do Produto (PRD) do **LabSto**, app mobile de controle de inventário de laboratório com cadastro assistido por IA a partir da foto do rótulo.

---

## Sumário

1. [Visão geral](#1-visão-geral)
2. [Problema](#2-problema)
3. [Público-alvo](#3-público-alvo)
4. [Como resolvem hoje](#4-como-resolvem-hoje)
5. [Objetivos e métricas de sucesso](#5-objetivos-e-métricas-de-sucesso)
6. [Requisitos funcionais](#6-requisitos-funcionais)
7. [Requisitos não-funcionais](#7-requisitos-não-funcionais)
8. [Histórias de usuário](#8-histórias-de-usuário)
9. [Telas e navegação](#9-telas-e-navegação)
10. [Escopo e não escopo](#10-escopo-e-não-escopo)
11. [Histórico de revisões](#11-histórico-de-revisões)

---

## 1. Visão geral

Aplicativo mobile para cadastrar, localizar e controlar reagentes, vidraria e equipamentos de laboratório. O diferencial é o **cadastro a partir da foto do rótulo**: uma LLM lê a embalagem e **sugere** nome, concentração, fabricante, lote, número CAS e validade, que o usuário confere antes de salvar. A IA nunca grava dados sem confirmação humana.

Para reagentes, o app consulta a base pública **PubChem** e mostra fórmula, massa molar e classificação de perigo, sem que ninguém precise digitar essas informações.

---

## 2. Problema

- Reagentes **vencem no fundo do armário** sem que ninguém perceba.
- **Equipamentos emprestados** somem: não se sabe com quem estão nem quando voltam.
- Itens são **comprados em duplicidade** porque o existente estava em outra prateleira.
- O controle, quando existe, é **uma planilha que só uma pessoa atualiza** — se ela sai ou esquece, o inventário deixa de refletir a realidade.
- **Digitar item por item à mão** é tão trabalhoso que o inventário nunca sai do papel.

---

## 3. Público-alvo

| Persona | Quem é | O que precisa | Perfil no app |
|---|---|---|---|
| **Professor responsável** | Coordena o laboratório e aprova compras | Visão geral do estoque, evitar compras duplicadas, rastrear responsáveis | Administrador |
| **Técnico de laboratório** | Responsável pela organização diária | Cadastrar rápido, saber o que está vencendo, controlar empréstimos | Técnico |
| **Estudante de iniciação científica** | Usa itens nos experimentos | Encontrar itens, registrar retirada e devolução sem burocracia | Estudante |

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

**Prioridade:** Alta (obrigatório no MVP) · Média (desejável) · Baixa (se sobrar tempo)

### 6.1 Autenticação e usuários

| ID | Requisito | Prioridade |
|---|---|---|
| RF01 | O sistema deve permitir **login** com e-mail e senha. | Alta |
| RF02 | O sistema deve permitir **cadastro de usuário** com nome, e-mail e senha. Toda conta nova recebe o perfil **Estudante** ([ADR-008](03-ADRs/ADR%20008%20—%20Atribuição%20de%20perfis%20de%20usuário.md)). | Alta |
| RF03 | O sistema deve permitir **recuperação de senha** por link enviado ao e-mail. | Média |
| RF04 | O sistema deve ter **três perfis**: Administrador (professor), Técnico e Estudante, com permissões distintas (ver [matriz](#matriz-de-permissões)). | Alta |
| RF05 | O Administrador deve poder **alterar o perfil** e **desativar** usuários, em uma lista de usuários. | Alta |
| RF06 | O sistema deve permitir **logout**. | Alta |

### 6.2 Cadastro de itens no inventário

| ID | Requisito | Prioridade |
|---|---|---|
| RF07 | O sistema deve permitir **cadastrar item** com: tipo (reagente, vidraria, equipamento), nome, quantidade, unidade, local (RF12), fabricante, concentração, lote, número CAS, validade, estoque mínimo e observações. Obrigatórios: tipo, nome, quantidade, unidade e local; validade é obrigatória para reagentes. | Alta |
| RF08 | O sistema deve permitir **tirar foto do rótulo** e enviar à LLM para extrair nome, concentração, fabricante, lote, número CAS e validade. A foto é usada só na extração e **não é armazenada**. A chamada passa por um servidor intermediário que guarda a chave da LLM ([ADR-006](03-ADRs/ADR%20006%20—%20Integração%20com%20a%20IA.md)). | Alta |
| RF09 | Campos preenchidos pela IA devem aparecer **destacados como sugestão** e só são salvos após confirmação do usuário. | Alta |
| RF10 | ~~Ler código de barras~~ — **removido na revisão do PRD** (ver [histórico](#11-histórico-de-revisões)). | — |
| RF11 | O sistema deve permitir **editar** e **excluir** itens. A exclusão é **lógica** (o item é arquivado e some das listas, mas o histórico é preservado). | Alta |
| RF12 | O sistema deve permitir **cadastrar, editar e excluir locais** (sala → armário → prateleira). Um local só pode ser excluído se não houver itens nele. | Alta |
| RF13 | O sistema deve **avisar possível duplicidade** ao cadastrar item com nome e fabricante já existentes, com link para o item existente. | Média |

### 6.3 Retirada, consumo e devolução

| ID | Requisito | Prioridade |
|---|---|---|
| RF14 | O sistema deve registrar **retirada (empréstimo)** com item, quantidade, finalidade, responsável e data prevista de devolução. | Alta |
| RF15 | O sistema deve registrar **devolução**, restaurando a quantidade e encerrando o empréstimo. | Alta |
| RF16 | O sistema deve registrar **consumo** de reagentes (baixa sem devolução), na mesma tela da retirada. | Alta |
| RF17 | O sistema deve listar **empréstimos atrasados** em destaque. | Média |

### 6.4 Validade e alertas

| ID | Requisito | Prioridade |
|---|---|---|
| RF18 | O sistema deve **alertar no app** sobre itens com vencimento próximo, com prazo configurável pelo usuário. | Alta |
| RF19 | O sistema deve **marcar como vencidos** itens com validade ultrapassada. | Alta |
| RF20 | O sistema deve enviar **notificação local** diária com o resumo de itens vencendo e devoluções atrasadas, se o usuário permitir notificações. | Média |
| RF21 | O sistema deve alertar quando a quantidade ficar **abaixo do estoque mínimo** definido no item. | Baixa |

### 6.5 Busca, histórico e consulta externa

| ID | Requisito | Prioridade |
|---|---|---|
| RF22 | O sistema deve permitir **buscar** por nome, tipo e local, com filtros combináveis. | Alta |
| RF23 | O sistema deve exibir o **histórico de movimentação** de cada item (cadastro, edição, retirada, devolução, consumo, exclusão), com usuário e data/hora. | Alta |
| RF24 | O sistema deve exibir um **painel** com totais: itens, vencendo, vencidos, emprestados, atrasados e abaixo do mínimo, além das movimentações recentes. | Média |
| RF25 | O sistema deve **exportar** o inventário em CSV e abrir a opção de compartilhar o arquivo. | Baixa |
| RF26 | Para reagentes, o sistema deve **consultar a PubChem** (pelo número CAS ou, sem CAS, pelo nome) e exibir fórmula molecular, massa molar e classificação de perigo GHS, com indicação de carregamento e mensagem de erro ([ADR-007](03-ADRs/ADR%20007%20—%20API%20externa.md)). | Alta |

### Matriz de permissões

| Ação | Administrador | Técnico | Estudante |
|---|---|---|---|
| Alterar perfil / desativar usuários | Sim | Não | Não |
| Cadastrar / editar / excluir item | Sim | Sim | Não |
| Cadastrar / editar / excluir locais | Sim | Sim | Não |
| Registrar retirada / devolução / consumo | Sim | Sim | Sim |
| Buscar, ver histórico e dados da PubChem | Sim | Sim | Sim |
| Exportar CSV | Sim | Sim | Não |

---

## 7. Requisitos não-funcionais

Todos os requisitos abaixo são **verificáveis** com os recursos do grupo (celulares reais, Expo Go e plano gratuito do Firebase). Metas que exigiriam teste de carga ou infraestrutura paga foram ajustadas na revisão do PRD.

### Desempenho

| ID | Requisito | Como verificar |
|---|---|---|
| RNF01 | A busca deve retornar resultados em **≤ 1 s** com **500 itens** no banco local. | Carga de 500 itens de teste + cronômetro no app |
| RNF02 | A extração de dados do rótulo pela IA deve responder em **≤ 8 s** com o servidor ativo. Quando o servidor estiver "dormindo" (plano gratuito do Render), a primeira chamada pode levar até **60 s**; nesse caso o app mostra progresso e permite **cancelar e seguir no cadastro manual**. | 10 extrações cronometradas |
| RNF03 | ~~Leitura de código de barras~~ — **removido** junto com o RF10. | — |
| RNF04 | Telas devem carregar em **≤ 2 s** em conexão 4G ou Wi-Fi. | Teste manual nos aparelhos do grupo |
| RNF05 | Uma alteração feita em um aparelho deve aparecer em outro aparelho em **≤ 1 min**, após a sincronização. | Dois celulares lado a lado na apresentação |

### Qualidade da IA

| ID | Requisito | Como verificar |
|---|---|---|
| RNF06 | A IA deve acertar **≥ 80%** dos campos extraídos em um conjunto de **20 rótulos reais** fotografados no laboratório. | Planilha de conferência campo a campo |
| RNF07 | **100%** dos campos sugeridos pela IA devem exigir confirmação antes de salvar (0 gravações automáticas). | Revisão de código + teste manual |
| RNF08 | Imagens enviadas à IA devem ser comprimidas para **≤ 500 KB** (lado maior ≤ 1.600 px). | Log do tamanho antes do envio |

### Segurança e privacidade

| ID | Requisito |
|---|---|
| RNF09 | Senhas com mínimo de **8 caracteres**, incluindo **1 número** e **1 letra**, validadas no formulário antes do envio. |
| RNF10 | **0 senhas** gravadas no Firestore ou no aparelho: autenticação e hash ficam 100% no Firebase Authentication. |
| RNF11 | A **sessão persiste** entre aberturas do app até o usuário fazer logout. Telas privadas são inacessíveis sem sessão ([ADR-005](03-ADRs/ADR%20005%20—%20Navegação%20e%20rotas%20protegidas.md)). |
| RNF12 | **100%** do tráfego via **HTTPS** (Firebase, servidor da IA e PubChem). |
| RNF13 | **100%** das coleções do Firestore protegidas por Security Rules que aplicam a matriz de permissões; **0 regras** `allow read, write: if true`. |
| RNF14 | Link de recuperação de senha expira em **1 h**. |
| RNF15 | **0 chaves de API** versionadas no repositório e **0 chaves secretas embutidas no app**: a chave da LLM existe apenas nas variáveis de ambiente do servidor intermediário ([ADR-006](03-ADRs/ADR%20006%20—%20Integração%20com%20a%20IA.md)). A configuração do Firebase (incluindo seu `apiKey`) vai no app por exigência do próprio Firebase e não é secreta: ela só identifica o projeto, e o acesso aos dados é controlado pelas Security Rules (RNF13). |
| RNF31 | O servidor da IA só atende requisições com **token válido do Firebase Authentication**, com limite de **30 extrações por usuário por dia**. |

### Disponibilidade e dados

| ID | Requisito |
|---|---|
| RNF16 | ~~Disponibilidade mensal de 99%~~ — **removido**, substituído pelo RNF32. |
| RNF17 | ~~Exportação semanal em JSON~~ — **removido**; o backup é a exportação manual em CSV (RF25). |
| RNF32 | Falha ou indisponibilidade da **IA** ou da **PubChem** não pode impedir nenhum fluxo principal: o cadastro manual e o detalhe do item continuam funcionando. |
| RNF18 | Operar dentro da cota gratuita do Firestore: **≤ 50.000 leituras** e **≤ 20.000 gravações** por dia, com listas paginadas em **20 itens** por página. |
| RNF19 | **0 bytes** gravados em Cloud Storage (o Storage exige plano Blaze); a foto do rótulo nunca é armazenada. |
| RNF20 | O histórico de movimentação é **imutável**: nenhuma tela permite editar ou apagar entradas, e as Security Rules bloqueiam `update` e `delete` na coleção. |
| RNF21 | Alerta padrão de vencimento **30 dias** antes, configurável entre **7 e 180 dias**. |

### Compatibilidade e usabilidade

| ID | Requisito |
|---|---|
| RNF22 | Funcionar pelo **Expo Go** em Android e iOS, nas versões suportadas pelo SDK do Expo usado no projeto, testado em pelo menos **2 aparelhos reais**. |
| RNF23 | Contraste de texto **≥ 4,5:1** (WCAG AA). |
| RNF24 | Áreas de toque com **≥ 48 × 48 dp**. |
| RNF25 | Registrar uma retirada em **≤ 4 toques** a partir da tela do item. |
| RNF26 | Um técnico usando o app pela primeira vez deve cadastrar um item em **≤ 2 min** sem treinamento (teste com **5 usuários** com perfil Técnico). |
| RNF29 | **Todas as listagens** tratam os estados de **carregamento**, **vazio** e **erro**, com opção de tentar novamente. |
| RNF30 | Se o usuário **negar a permissão** de câmera ou de notificações, o app explica o motivo, oferece abrir as configurações do aparelho e segue funcionando (cadastro manual; alertas só dentro do app). |

### Manutenibilidade

| ID | Requisito |
|---|---|
| RNF27 | As regras de negócio ficam isoladas na camada de serviços ([ADR-004](03-ADRs/ADR%20004%20—%20Arquitetura%20em%20camadas.md)) e têm **testes automatizados** (Jest) cobrindo, no mínimo, os critérios de aceite das US05, US06 e US07. |
| RNF28 | Nova versão testável em **≤ 15 min** via Expo Go. |

---

## 8. Histórias de usuário

### US01 — Login
**Como** usuário cadastrado, **quero** entrar com e-mail e senha **para** acessar o inventário do meu laboratório.

**Critérios de aceite**
- [ ] **Dado** e-mail e senha corretos, **quando** toco em "Entrar", **então** vejo o painel em ≤ 2 s.
- [ ] **Dado** senha incorreta, **quando** tento entrar, **então** vejo "E-mail ou senha inválidos" (sem indicar qual está errado).
- [ ] **Dado** muitas tentativas falhas seguidas, **quando** o Firebase bloqueia temporariamente, **então** vejo "Muitas tentativas. Tente novamente mais tarde."
- [ ] **Dado** que já entrei antes e não fiz logout, **quando** reabro o app, **então** vou direto para o painel.

---

### US02 — Cadastro de usuário
**Como** novo membro do laboratório, **quero** criar minha conta **para** registrar retiradas no meu nome.

**Critérios de aceite**
- [ ] **Dado** nome, e-mail válido e senha dentro da regra, **quando** envio o cadastro, **então** a conta é criada com perfil **Estudante** e entro no app.
- [ ] **Dado** e-mail já cadastrado, **quando** envio, **então** vejo "E-mail já em uso".
- [ ] **Dado** senha fora da regra (RNF09), **quando** preencho, **então** o botão fica bloqueado e a regra é exibida.
- [ ] O formulário de cadastro **não** oferece escolha de perfil.

---

### US03 — Cadastro de item com foto do rótulo
**Como** técnico, **quero** fotografar o rótulo de um reagente **para** não digitar os dados à mão.

**Critérios de aceite**
- [ ] **Dado** que tirei a foto, **quando** a IA responde, **então** nome, concentração, fabricante, lote, CAS e validade aparecem preenchidos e **destacados como sugestão**.
- [ ] **Dado** campos sugeridos, **quando** não confirmo, **então** o item **não** é salvo.
- [ ] **Dado** que a IA não conseguiu ler um campo, **quando** a resposta chega, **então** o campo fica vazio (nunca inventado) e sinalizado.
- [ ] **Dado** falha, resposta fora do formato esperado ou demora, **quando** ocorre, **então** posso seguir com cadastro manual sem tirar a foto de novo.
- [ ] **Dado** que neguei a permissão de câmera, **quando** abro o cadastro por foto, **então** vejo a explicação e a opção de cadastro manual.
- [ ] **Dado** item salvo, **quando** abro o histórico, **então** consta "cadastrado (sugestão IA confirmada)" com meu nome e data/hora.

---

### US04 — Cadastro manual de item
**Como** técnico, **quero** cadastrar vidraria e equipamentos sem foto **para** registrar itens sem rótulo.

**Critérios de aceite**
- [ ] **Dado** tipo, nome, quantidade, unidade e local preenchidos, **quando** salvo, **então** o item aparece na busca imediatamente.
- [ ] **Dado** que falta um campo obrigatório, **quando** tento salvar, **então** o campo é destacado com mensagem.
- [ ] **Dado** reagente sem validade, **quando** tento salvar, **então** a validade é exigida.
- [ ] **Dado** nome e fabricante iguais a um item existente, **quando** salvo, **então** vejo aviso de possível duplicidade com link para o item.

---

### US05 — Retirada e consumo de item
**Como** estudante, **quero** registrar que peguei um item **para** que saibam com quem ele está.

**Critérios de aceite**
- [ ] **Dado** um item disponível, **quando** registro retirada com data prevista, **então** a quantidade disponível diminui e o empréstimo aparece com meu nome.
- [ ] **Dado** quantidade maior que a disponível, **quando** confirmo, **então** o sistema bloqueia e mostra o saldo.
- [ ] **Dado** data prevista no passado, **quando** confirmo, **então** o sistema não aceita.
- [ ] **Dado** um reagente, **quando** escolho "Consumo", **então** a quantidade é baixada sem data de devolução e sem gerar empréstimo.
- [ ] **Dado** qualquer falha durante o registro, **quando** ocorre, **então** nada é gravado (nem empréstimo, nem baixa, nem histórico).

---

### US06 — Devolução de item
**Como** estudante, **quero** registrar a devolução **para** encerrar minha responsabilidade sobre o item.

**Critérios de aceite**
- [ ] **Dado** um empréstimo aberto, **quando** registro a devolução, **então** a quantidade é restaurada e o empréstimo sai da lista de abertos.
- [ ] **Dado** devolução após a data prevista, **quando** registro, **então** o histórico marca "devolvido com atraso de N dias".

---

### US07 — Alerta de validade
**Como** técnico, **quero** ser avisado antes de um reagente vencer **para** usá-lo ou planejar a reposição.

**Critérios de aceite**
- [ ] **Dado** item com validade em ≤ 30 dias (padrão), **quando** abro o app, **então** ele aparece no painel em "Vencendo".
- [ ] **Dado** item com validade ultrapassada, **quando** abro o app, **então** ele aparece como "Vencido" em vermelho.
- [ ] **Dado** que alterei o prazo para 60 dias, **quando** salvo, **então** a contagem "Vencendo" é recalculada.
- [ ] **Dado** notificações ativas, **quando** há itens na janela de alerta, **então** recebo **1 notificação por dia** com o resumo (não 1 por item).

---

### US08 — Busca
**Como** professor, **quero** buscar um reagente antes de comprar **para** não comprar algo que já temos.

**Critérios de aceite**
- [ ] **Dado** um termo parcial ("etan"), **quando** busco, **então** vejo itens que contêm o termo (ex.: "Etanol 70%") em ≤ 1 s.
- [ ] **Dado** filtros de tipo e local, **quando** aplico, **então** apenas itens que atendem a todos os filtros aparecem.
- [ ] **Dado** nenhum resultado, **quando** busco, **então** vejo "Nenhum item encontrado" e opção de cadastrar.

---

### US09 — Histórico de movimentação
**Como** professor, **quero** ver o histórico de um item **para** saber quem o usou por último.

**Critérios de aceite**
- [ ] **Dado** um item, **quando** abro o detalhe, **então** vejo todas as movimentações em ordem decrescente com tipo, usuário, quantidade e data/hora.
- [ ] **Dado** qualquer perfil, **quando** procuro editar ou apagar uma entrada do histórico, **então** a ação não existe.

---

### US10 — Dados de segurança do reagente (PubChem)
**Como** estudante, **quero** ver a fórmula e os perigos de um reagente **para** manuseá-lo com segurança.

**Critérios de aceite**
- [ ] **Dado** um reagente com CAS, **quando** abro o detalhe, **então** vejo fórmula, massa molar e pictogramas GHS vindos da PubChem.
- [ ] **Dado** que a consulta está em andamento, **quando** abro o detalhe, **então** vejo um indicador de carregamento só nessa seção.
- [ ] **Dado** falha de rede ou composto não encontrado, **quando** a resposta chega, **então** vejo a mensagem correspondente e o restante do detalhe continua utilizável.

---

### US11 — Exportar inventário
**Como** professor, **quero** exportar o inventário **para** abrir em uma planilha ou enviar à coordenação.

**Critérios de aceite**
- [ ] **Dado** perfil Administrador ou Técnico, **quando** toco em "Exportar CSV", **então** o app gera o arquivo e abre o menu de compartilhamento do aparelho.
- [ ] **Dado** perfil Estudante, **quando** abro o perfil, **então** a opção não aparece.

---

### US12 — Gerenciar perfis de usuários
**Como** professor, **quero** promover um usuário a Técnico **para** que ele possa cadastrar itens.

**Critérios de aceite**
- [ ] **Dado** perfil Administrador, **quando** abro a lista de usuários e altero o perfil de alguém, **então** a mudança vale no próximo acesso dessa pessoa.
- [ ] **Dado** um usuário desativado, **quando** ele tenta entrar, **então** vê "Conta desativada. Procure o responsável pelo laboratório."
- [ ] **Dado** perfil Técnico ou Estudante, **quando** navego pelo app, **então** a lista de usuários não aparece.

---

## 9. Telas e navegação

As telas abaixo substituem o fluxo do protótipo da Entrega 1. Foram **acrescentadas** as telas de Inventário (lista), Detalhe do item, Locais, Perfil e Usuários, que não estavam no protótipo e são necessárias para cumprir os requisitos e a navegação com parâmetros. A navegação usa Expo Router ([ADR-005](03-ADRs/ADR%20005%20—%20Navegação%20e%20rotas%20protegidas.md)).

### Mapa de telas

| # | Tela | Rota | Parâmetros | Requisitos | Listagem com estados? |
|---|---|---|---|---|---|
| — | Login | `/(auth)/login` | — | RF01 | — |
| — | Cadastro de usuário | `/(auth)/cadastro` | — | RF02 | — |
| — | Recuperar senha | `/(auth)/recuperar-senha` | — | RF03 | — |
| 1 | Painel | `/(app)/(tabs)` | — | RF17, RF18, RF19, RF21, RF24 | Sim |
| 2 | Inventário | `/(app)/(tabs)/inventario` | `filtro` (opcional: `vencendo`, `vencidos`, `abaixo-minimo`) | RF22 | Sim |
| 3 | Detalhe do item | `/(app)/item/[id]` | `id` | RF11, RF23, RF26 | Sim (histórico) |
| 4 | Formulário de item | `/(app)/item/form` | `id` (opcional: presente = edição) | RF07, RF09, RF11, RF13 | — |
| 5 | Cadastro por foto | `/(app)/item/foto` | — | RF08 | — |
| 6 | Retirada / consumo | `/(app)/retirada/[itemId]` | `itemId` | RF14, RF16 | — |
| 7 | Empréstimos | `/(app)/(tabs)/emprestimos` | — | RF15, RF17 | Sim |
| 8 | Locais | `/(app)/locais` | — | RF12 | Sim |
| 9 | Perfil e configurações | `/(app)/(tabs)/perfil` | — | RF06, RF18, RF20, RF25 | — |
| 10 | Usuários (só Admin) | `/(app)/usuarios` | — | RF05 | Sim |

São **10 telas privadas** além de login e cadastro (o mínimo exigido é 5).

### Fluxo principal

```
Login ──► Painel ──(toca em "Vencendo")──► Inventário?filtro=vencendo
                                               │
                         ┌─────────────────────┘ toca em um item
                         ▼
                  Detalhe do item [id] ──► Editar (form?id=) ──► volta ao detalhe
                         │
                         └──► Retirada [itemId] ──► confirma ──► volta ao detalhe
                                                              (quantidade e histórico atualizados)

Inventário ──(botão +)──► Formulário (novo)  ou  Cadastro por foto ──► Formulário com sugestões
```

---

## 10. Escopo e não escopo

### Escopo (MVP)
- Login, cadastro de usuário, recuperação de senha, logout e três perfis de acesso
- Alteração de perfil e desativação de usuários pelo Administrador
- Cadastro, edição e exclusão lógica de itens (reagentes, vidraria, equipamentos)
- Cadastro assistido por IA a partir da foto do rótulo, **sempre com confirmação**
- Cadastro de locais (sala → armário → prateleira)
- Registro de retirada, devolução e consumo
- Controle de validade com alertas no app e notificação local diária
- Busca por nome, tipo e local
- Histórico de movimentação imutável por item
- Consulta de dados de reagentes na PubChem
- Exportação do inventário em CSV
- **Um laboratório** por instalação

### Não escopo (fora do MVP)
- Leitura de código de barras (removido na revisão do PRD)
- Fluxo de aprovação de novas contas (substituído por "cadastro entra como Estudante")
- Notificação push remota (não funciona no Expo Go; usamos notificação local)
- Compras, orçamentos e integração com fornecedores
- Integração com o sistema patrimonial da instituição
- Múltiplos laboratórios / instituições na mesma conta
- Fichas de segurança (FISPQ/FDS) completas e regras de compatibilidade química
- Controle de reagentes controlados (Polícia Federal / Exército)
- Versão web e modo offline completo (consulta funciona com o cache local; gravações exigem conexão)
- Geração e impressão de etiquetas
- Agendamento de uso de equipamentos
- Relatórios avançados e dashboards analíticos
- Backup automático agendado (exige plano pago); o backup é a exportação manual em CSV

---

## 11. Histórico de revisões


Revisão feita ao implementar as telas e ao conferir o PRD contra o enunciado da disciplina.

| Item | Mudança | Motivo |
|---|---|---|
| Nome | Padronizado como **LabSto — Inventário do Laboratório** | O PRD e o protótipo usavam nomes diferentes |
| RF02 | Cadastro não escolhe mais o perfil; toda conta nova é Estudante | Escolher o perfil no cadastro permitia que qualquer pessoa se tornasse Administrador ([ADR-008](03-ADRs/ADR%20008%20—%20Atribuição%20de%20perfis%20de%20usuário.md)) |
| RF05 | De "aprovar, editar e desativar" para "alterar perfil e desativar"; prioridade Média → Alta | Sem aprovação, a promoção a Técnico pelo Admin passa a ser obrigatória |
| RF07, RF08 | Acrescentados **número CAS**, concentração e estoque mínimo; local passa a referenciar o cadastro de locais | O CAS permite a consulta à PubChem; o estoque mínimo é usado pelo RF21 |
| RF08 | A chamada à LLM passa por um servidor intermediário | Manter a chave fora do app ([ADR-006](03-ADRs/ADR%20006%20—%20Integração%20com%20a%20IA.md)) |
| RF10, RNF03 | **Removidos** (código de barras) | Corte de escopo para priorizar os requisitos obrigatórios da disciplina |
| RF11 | "Arquivar" passa a ser apresentado como **excluir (exclusão lógica)** | O enunciado exige exclusão disponível na interface; a exclusão lógica também é necessária para a sincronização ([ADR-003](03-ADRs/ADR%20003%20—%20Sincronização%20dos%20dados.md)) |
| RF12 | Acrescentados editar e excluir locais | CRUD completo na interface |
| RF16 | Consumo registrado na mesma tela da retirada | Menos telas e menos toques (RNF25) |
| RF20 | "Notificação push" → **notificação local** | Push remoto não funciona no Expo Go |
| RF26 | **Novo**: consulta à PubChem | O enunciado exige o consumo de uma API externa |
| RNF01 | 10.000 itens → 500 itens | Meta verificável com os recursos do grupo |
| RNF02 | Acrescentado o caso do servidor "dormindo" | Limitação do plano gratuito do Render |
| RNF05 | 50 usuários simultâneos → sincronização entre 2 aparelhos em ≤ 1 min | Teste de carga não é viável; a nova meta pode ser demonstrada |
| RNF06 | 85% em 100 rótulos → 80% em 20 rótulos | Conjunto de teste viável no semestre |
| RNF09 | Validação da senha feita no formulário | Dá retorno imediato ao usuário e não depende de configuração extra no Firebase |
| RNF11 | "Sessão encerrada após 30 min" → **sessão persiste até logout** | Conflitava com a exigência de sessão persistente do enunciado |
| RNF15 | Chave secreta também não pode estar embutida no app; esclarecido que a configuração do Firebase não é secreta | Consequência da [ADR-006](03-ADRs/ADR%20006%20—%20Integração%20com%20a%20IA.md) |
| RNF26 | "Usuário novo" → "técnico usando o app pela primeira vez" | Conta nova é Estudante e não pode cadastrar itens ([ADR-008](03-ADRs/ADR%20008%20—%20Atribuição%20de%20perfis%20de%20usuário.md)) |
| RNF31 | **Novo**: servidor da IA exige token do Firebase e limita uso por usuário | Sem isso, qualquer pessoa poderia chamar o servidor e gastar a cota ([ADR-006](03-ADRs/ADR%20006%20—%20Integração%20com%20a%20IA.md)) |
| RNF16 → RNF32 | 99% de disponibilidade → falha da IA ou da PubChem não bloqueia fluxos | A disponibilidade depende de serviços de terceiros; a nova meta é testável |
| RNF17 | Backup semanal em JSON → **removido**; backup via exportação CSV (RF25) | Backup agendado exige plano pago |
| RNF20 | Retenção de 5 anos → histórico imutável | Retenção de 5 anos não é verificável; imutabilidade é |
| RNF22 | Android 10+ / iOS 15+ → versões suportadas pelo Expo Go do SDK usado | A versão mínima é definida pelo SDK, não pelo grupo |
| RNF27 | 70% de cobertura → testes dos critérios das US05, US06 e US07 | Meta realista e focada nas regras de maior risco |
| RNF29, RNF30 | **Novos**: estados de listagem e permissões negadas | Exigências explícitas do enunciado |
| US02, US03, US05 | Critérios ajustados às mudanças acima | — |
| US10, US11, US12 | **Novas** | Cobrem RF26, RF25 e RF05 |
| Seção 9 | **Nova**: mapa de telas, rotas e parâmetros | O protótipo não tinha lista, detalhe, locais, perfil e usuários |
