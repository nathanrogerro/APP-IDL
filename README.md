# 🧪 LabSto — Inventário do Laboratório

Aplicativo mobile para controle de inventário de reagentes, vidraria e equipamentos de laboratório, com **cadastro assistido por IA a partir da foto do rótulo**, controle de validade, empréstimos e histórico de movimentação.

## 🖥️ Protótipo

- [Protótipo das telas](docs/02-labsto_mobile_app_prototype.html)


---

## ▶️ Como executar

### Pré-requisitos

- [Node.js](https://nodejs.org/) **22.13 ou superior** (LTS 22 ou 24; `node -v` para conferir). O Expo SDK 58 não funciona com o Node 20.
- [Git](https://git-scm.com/)
- Aplicativo **Expo Go** atualizado no celular ([Android](https://play.google.com/store/apps/details?id=host.exp.exponent) · [iOS](https://apps.apple.com/app/expo-go/id982107779)). O projeto usa o **Expo SDK 58**.
- Celular e computador **na mesma rede Wi-Fi** (ou use o modo túnel, abaixo)

### Passo a passo

```bash
git clone https://github.com/nathanrogerro/APP-IDL.git
cd APP-IDL
npm install
npx expo start
```

1. Um **QR code** aparece no terminal.
2. **Android:** abra o Expo Go e toque em "Scan QR code". **iOS:** abra a câmera do iPhone e aponte para o QR code.
3. O app abre no celular. Na primeira execução, o banco local é criado e preenchido com os dados de exemplo.

**O QR code não conecta?** (comum em redes da universidade, que isolam os aparelhos) Pare o servidor com `Ctrl+C` e rode:

```bash
npx expo start --tunnel
```

Na primeira vez, o Expo pergunta se pode instalar o pacote `@expo/ngrok`, necessário para o túnel. Responda `Y` (sim).

### Usuários de exemplo (Entrega 2)

Nesta entrega **não há autenticação real** (ela faz parte da Entrega 3, conforme o enunciado). Na tela de login, digite um dos e-mails abaixo; **qualquer senha** é aceita. Os botões "Contas de exemplo", no fim da tela de login, preenchem os campos automaticamente. Cada usuário tem um perfil diferente, para demonstrar a [matriz de permissões](docs/01-PRD.md#matriz-de-permissões).

| E-mail | Perfil |
|---|---|
| `admin@labsto.dev` | Administrador |
| `tecnico@labsto.dev` | Técnico |
| `estudante@labsto.dev` | Estudante |
| `bruno@labsto.dev` | Estudante com **conta desativada** (o login é recusado) |

Contas criadas pela tela "Criar conta" entram como Estudante e ficam salvas no aparelho.

### Dados de exemplo

O app já vem com itens, locais e empréstimos de exemplo, incluindo reagentes vencidos, reagentes vencendo e um empréstimo atrasado, para que o painel e os alertas tenham conteúdo. Para voltar ao estado inicial: **Perfil → Restaurar dados de exemplo**.

Para mostrar o estado de erro das listagens, ative **Perfil → Simular erro nas listagens**: as listas passam a exibir a mensagem de erro com o botão "Tentar novamente". As duas opções aparecem no Expo Go (modo de desenvolvimento).

### Variáveis de ambiente

A **Entrega 2 não precisa de nenhuma variável de ambiente**.

A partir da Entrega 3, copie `.env.example` para `.env` e preencha os valores. O arquivo `.env` está no `.gitignore` e **nunca** é versionado.

| Variável | Onde | Para quê |
|---|---|---|
| `EXPO_PUBLIC_FIREBASE_*` | App (`.env`) | Configuração do projeto Firebase. Não é segredo: o acesso aos dados é controlado pelas Security Rules |
| `EXPO_PUBLIC_IA_URL` | App (`.env`) | Endereço do servidor de IA no Render |
| `GEMINI_API_KEY` | **Somente** no painel do Render | Chave do Gemini. Nunca fica no app nem no repositório ([ADR-006](docs/03-ADRs/ADR%20006%20—%20Integração%20com%20a%20IA.md)) |
| `GEMINI_MODEL`, `FIREBASE_PROJECT_ID` | Painel do Render | Configuração do servidor de IA |

**Primeiro administrador (Entrega 3):** toda conta nova é criada como Estudante ([ADR-008](docs/03-ADRs/ADR%20008%20—%20Atribuição%20de%20perfis%20de%20usuário.md)). Para definir o primeiro Administrador, cadastre-se pelo app, abra o [console do Firebase](https://console.firebase.google.com/) → Firestore → coleção `usuarios` → documento da sua conta, e altere o campo `perfil` para `admin`. Os demais perfis são alterados pelo próprio app, na tela Usuários.

---

## 🧱 Tecnologias

| Área | Tecnologia | Decisão |
|---|---|---|
| App | React Native + **Expo** (Expo Go), JavaScript | Exigência da disciplina |
| Navegação | **Expo Router** | [ADR-005](docs/03-ADRs/ADR%20005%20—%20Navegação%20e%20rotas%20protegidas.md) |
| Banco local | **expo-sqlite** | [ADR-002](docs/03-ADRs/ADR%20002%20—%20Persistencia%20local%20remota.md) |
| Banco remoto | **Firebase Firestore** (Entrega 3) | [ADR-002](docs/03-ADRs/ADR%20002%20—%20Persistencia%20local%20remota.md), [ADR-003](docs/03-ADRs/ADR%20003%20—%20Sincronização%20dos%20dados.md) |
| Autenticação | **Firebase Authentication** (Entrega 3) | [ADR-005](docs/03-ADRs/ADR%20005%20—%20Navegação%20e%20rotas%20protegidas.md), [ADR-008](docs/03-ADRs/ADR%20008%20—%20Atribuição%20de%20perfis%20de%20usuário.md) |
| IA | **Google Gemini** via servidor no **Render** (Entrega 3) | [ADR-006](docs/03-ADRs/ADR%20006%20—%20Integração%20com%20a%20IA.md) |
| API externa | **PubChem** (Entrega 3) | [ADR-007](docs/03-ADRs/ADR%20007%20—%20API%20externa.md) |
| Recursos nativos | Câmera (`expo-camera`) e notificações locais (`expo-notifications`) | [PRD — RF08, RF20](docs/01-PRD.md) |
| Estado | React Context (apenas sessão) + hooks | [ADR-004](docs/03-ADRs/ADR%20004%20—%20Arquitetura%20em%20camadas.md) |

---

## 🏗️ Arquitetura

O app é organizado em quatro camadas. Cada uma só conversa com a de baixo:

```
Telas (app/)  →  Hooks (hooks/)  →  Serviços (services/)  →  Repositórios (data/)
 exibem          carregando /        regras de negócio        SQLite (Entrega 2)
 dados           erro / vazio        e transações             + Firestore (Entrega 3)
```

Com isso, a troca do banco local para o Firestore na Entrega 3 fica restrita à pasta `data/`, sem reescrever as telas. Detalhes, alternativas consideradas e consequências na [ADR-004](docs/03-ADRs/ADR%20004%20—%20Arquitetura%20em%20camadas.md).

### Estrutura do repositório

```
app/            telas e rotas (Expo Router)
components/     componentes visuais reutilizáveis
hooks/          acesso a dados para as telas
services/       regras de negócio
data/           SQLite: esquema, dados de exemplo e repositórios
context/        sessão do usuário
constants/      cores, estilos e textos fixos
utils/          funções de data, texto e validação
server/         servidor de IA para o Render (Entrega 3)
docs/           PRD, ADRs, protótipo e diário de IA
```

---

## 📚 Documentação

- [PRD — Documento de Requisitos do Produto](docs/01-PRD.md)
- [Protótipo das telas (Entrega 1)](docs/02-labsto_mobile_app_prototype.html)
- Decisões de arquitetura (ADRs):
  - [ADR-001 — Modelagem dos dados](docs/03-ADRs/ADR%20001%20—%20Modelagem%20de%20dados.md)
  - [ADR-002 — Persistência local e remota](docs/03-ADRs/ADR%20002%20—%20Persistencia%20local%20remota.md)
  - [ADR-003 — Sincronização dos dados](docs/03-ADRs/ADR%20003%20—%20Sincronização%20dos%20dados.md)
  - [ADR-004 — Arquitetura em camadas](docs/03-ADRs/ADR%20004%20—%20Arquitetura%20em%20camadas.md)
  - [ADR-005 — Navegação e rotas protegidas](docs/03-ADRs/ADR%20005%20—%20Navegação%20e%20rotas%20protegidas.md)
  - [ADR-006 — Integração com a IA](docs/03-ADRs/ADR%20006%20—%20Integração%20com%20a%20IA.md)
  - [ADR-007 — API externa: PubChem](docs/03-ADRs/ADR%20007%20—%20API%20externa.md)
  - [ADR-008 — Atribuição de perfis](docs/03-ADRs/ADR%20008%20—%20Atribuição%20de%20perfis%20de%20usuário.md)
- [Diário de bordo de uso de IA](docs/Diário-de-bordo-de-uso-de-IA.md)
