# ADR 004 — Arquitetura em camadas

**Status:** Aceita · **Data:** 24/10

## Resumo

No contexto de um app que começa usando apenas SQLite e na Entrega 3 passa a usar Firestore, Firebase Authentication, uma LLM e uma API externa, diante da necessidade de trocar a fonte dos dados sem reescrever as telas e de manter as regras de negócio em um único lugar, decidimos por uma **arquitetura em quatro camadas — telas, hooks, serviços e repositórios — com estado global apenas para a sessão (React Context)**, para alcançar telas simples, regras testáveis e uma troca de banco localizada, aceitando mais arquivos e um pouco mais de código do que acessar o banco direto das telas.

## Contexto

- O app é construído primeiro com telas, navegação e persistência local (**fase local**); a Entrega 3 acrescenta Firestore, autenticação, IA e PubChem. **A mesma tela precisa funcionar nas duas fases.**
- As regras de negócio (saldo, datas, exclusão lógica, histórico) aparecem em mais de uma tela. Se ficarem nas telas, serão duplicadas e divergirão.
- O enunciado exige estados de **carregamento, vazio e erro** em todas as listagens (RNF29); se cada tela implementar do seu jeito, algum será esquecido.
- Na apresentação final, **qualquer integrante pode ser questionado sobre qualquer parte**: o código precisa ter uma organização fácil de explicar.

## Alternativas consideradas

| # | Alternativa | Por que não |
|---|---|---|
| A | **Telas acessam o banco diretamente** | Mais rápido de escrever agora, mas a troca para o Firestore na Entrega 3 exigiria reescrever as 10 telas; regras ficariam espalhadas |
| B | **Camadas + biblioteca de estado global** (Redux, Zustand) | O único estado realmente compartilhado é a sessão. Uma biblioteca a mais é complexidade e mais um conceito para defender, sem ganho |
| **C** | **Camadas + React Context só para a sessão** | **Escolhida** |

## Solução

### As quatro camadas

```
┌────────────────────────── TELAS (app/) ──────────────────────────┐
│ Mostram dados e capturam toques. Nunca acessam o banco.          │
└──────────────┬───────────────────────────────────────────────────┘
               │ usam
┌──────────────▼──────────── HOOKS (hooks/) ───────────────────────┐
│ useItens(), useItem(id), useEmprestimos()...                     │
│ Devolvem { dados, carregando, erro, vazio, recarregar }          │
└──────────────┬───────────────────────────────────────────────────┘
               │ chamam
┌──────────────▼──────── SERVIÇOS (services/) ─────────────────────┐
│ Regras de negócio: saldo, datas, permissões, histórico,          │
│ transações. Chamadas à IA e à PubChem.                           │
└──────────────┬───────────────────────────────────────────────────┘
               │ chamam
┌──────────────▼────── REPOSITÓRIOS (data/) ───────────────────────┐
│ Leem e gravam. Fase local: SQLite. Entrega 3: SQLite + Firestore.│
└──────────────────────────────────────────────────────────────────┘

  AuthContext (context/): quem está logado, disponível para todo o app
```

| Camada | Responsabilidade | Não pode |
|---|---|---|
| **Telas** | Exibir dados, capturar ações, navegar | Acessar banco, conter regra de negócio |
| **Hooks** | Buscar dados para a tela e controlar carregando / erro / vazio; recarregar quando a tela volta ao foco | Conhecer SQL ou Firestore |
| **Serviços** | Validar regras, montar transações, registrar movimentações, chamar IA e PubChem | Importar componentes visuais |
| **Repositórios** | Executar consultas e gravações; filtrar `arquivado` | Decidir se uma operação é permitida |

**Regra de dependência:** cada camada só chama a camada imediatamente abaixo.

### Estrutura de pastas

```
app/                     telas (rotas do Expo Router, ADR-005)
components/              componentes visuais reutilizáveis (EstadoLista, CartaoItem, Botao...)
hooks/                   useItens, useItem, useEmprestimos, useLocais, usePainel...
services/                itensService, emprestimosService, locaisService, usuariosService,
                         iaService (E3), pubchemService (E3)
data/                    db.js (abertura e esquema do SQLite), seed.js,
                         *Repository.js (um por coleção da ADR-001)
context/                 AuthContext.js
constants/               cores, espaçamentos, textos fixos
```

### Tratamento de erros

O erro nasce na camada que tem a informação e sobe até a camada que sabe exibi-lo:

1. O **repositório** lança o erro técnico (falha no SQLite, sem conexão).
2. O **serviço** lança erros de regra com mensagem pronta para o usuário (`"Saldo insuficiente. Disponível: 3."`).
3. O **hook** captura e expõe em `erro`.
4. A **tela** exibe: em listagens, pelo componente `EstadoLista` (com "Tentar novamente"); em formulários, junto ao campo.

### Componente `EstadoLista`

Um único componente recebe `carregando`, `erro`, `vazio` e `onTentarNovamente` e é usado em **todas** as listagens (painel, inventário, histórico, empréstimos, locais e usuários). Assim, o RNF29 é garantido pela estrutura, não pela memória de quem escreve cada tela.

### O que muda entre as entregas

| Camada | Fase local | Entrega 3 |
|---|---|---|
| Telas | Implementadas, com espaços reservados para IA, PubChem, notificação e exportação | Só preenchem esses espaços; navegação e layout não mudam |
| Hooks | Implementados | Sem mudanças |
| Serviços | Regras de saldo, datas, histórico e exclusão | + checagem de perfil, chamada à IA e à PubChem |
| Repositórios | SQLite | SQLite (cache) + Firestore + sincronização |
| AuthContext | Usuário de exemplo escolhido pelo e-mail no login (sem senha) | Firebase Authentication com sessão persistente |

## Consequências

- **Ganho:** A troca do banco na Entrega 3 fica restrita a `data/` e `context/`.
- **Ganho:** As regras de negócio ficam em `services/`, que pode ser testado com Jest sem abrir o app (RNF27).
- **Ganho:** Estados de carregamento, vazio e erro ficam padronizados em todas as listagens.
- **Ganho:** A organização é simples de explicar: "a tela pede ao hook, o hook ao serviço, o serviço ao repositório".
- **Custo:** Uma funcionalidade simples passa por quatro arquivos. Aceitamos esse custo pela previsibilidade.
- **Custo:** Sem estado global de dados, duas telas abertas podem mostrar valores diferentes por um instante; isso é resolvido recarregando ao voltar o foco (`useFocusEffect`, [ADR-005](ADR-005-Navegacao-e-rotas-protegidas.md)).
