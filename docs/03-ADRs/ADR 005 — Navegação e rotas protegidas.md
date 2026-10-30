# ADR 005 — Navegação e rotas protegidas

**Status:** Aceita · **Data:** 25/10

## Resumo

No contexto de um app com telas públicas (login, cadastro) e privadas (inventário, empréstimos, perfil), diante da necessidade de navegar com passagem de parâmetros e de impedir o acesso a telas privadas sem sessão, decidimos por usar o **Expo Router com grupos de rotas `(auth)` e `(app)` e um único layout que funciona como "porteiro"**, para alcançar proteção centralizada e parâmetros pela própria URL da rota, aceitando que a estrutura de pastas passa a definir a navegação.

## Contexto

- O enunciado exige **navegação com passagem de parâmetros** e **telas privadas inacessíveis a quem não está autenticado** (Entrega 3).
- Se a proteção for feita tela por tela, basta uma tela esquecida para abrir uma brecha.
- Quando o usuário registra uma retirada e volta ao detalhe do item, a quantidade e o histórico precisam aparecer atualizados.

## Alternativas consideradas

| # | Alternativa | Por que não |
|---|---|---|
| A | **React Navigation** configurado manualmente | Funciona, mas exige declarar cada tela e cada tipo de parâmetro em código; mais configuração para o mesmo resultado |
| B | Expo Router com **verificação de sessão em cada tela** | Repetitivo e sujeito a esquecimento |
| **C** | **Expo Router com grupos e layout protetor** | **Escolhida** — é o padrão atual do Expo e a proteção fica em um arquivo |

## Solução

### Estrutura de rotas

```
app/
  _layout.js                 raiz: inicializa o SQLite e fornece o AuthContext
  (auth)/                    telas públicas
    login.js
    cadastro.js
    recuperar-senha.js
  (app)/                     telas privadas
    _layout.js               PORTEIRO: sem sessão → Redirect para /login
    (tabs)/                  barra inferior
      _layout.js
      index.js               Painel
      inventario.js
      emprestimos.js
      perfil.js
    item/[id].js             Detalhe
    item/form.js             Novo / editar
    item/foto.js             Cadastro por foto
    retirada/[itemId].js
    locais.js
    usuarios.js              (só Admin)
```

O mapa completo de telas, rotas e requisitos está na [seção 9 do PRD](../01-PRD.md#9-telas-e-navegação).

### Proteção das telas privadas

O `_layout.js` do grupo `(app)` consulta o `AuthContext`:

- sessão carregando → tela de carregamento;
- sem usuário → `<Redirect href="/login" />`;
- com usuário → renderiza as telas.

Telas e ações restritas por perfil, conforme a [matriz de permissões](../01-PRD.md#matriz-de-permissões), fazem uma segunda verificação: `usuarios.js` só abre para o Administrador; `item/form.js` e `item/foto.js` só abrem para Administrador e Técnico; em `locais.js` e no detalhe do item, os botões de criar, editar e excluir não aparecem para o Estudante. A proteção real dos dados é feita pelas Security Rules do Firestore (RNF13); a navegação apenas evita mostrar telas que o usuário não pode usar.

### Passagem de parâmetros

| Origem → destino | Parâmetro | Como |
|---|---|---|
| Inventário → Detalhe | `id` | `router.push('/item/' + item.id)`; no destino, `useLocalSearchParams()` |
| Detalhe → Retirada | `itemId` | `router.push('/retirada/' + id)` |
| Detalhe → Editar | `id` | `router.push({ pathname: '/item/form', params: { id } })` |
| Painel → Inventário filtrado | `filtro` | `router.navigate({ pathname: '/inventario', params: { filtro: 'vencendo' } })` (`navigate`, porque o destino é uma aba) |
| Painel → Empréstimos atrasados | `filtro` | `router.navigate({ pathname: '/emprestimos', params: { filtro: 'atrasados' } })` |

Os parâmetros carregam **apenas IDs e filtros**, nunca o objeto inteiro: a tela de destino busca o dado atualizado pelo hook. Assim, a tela nunca mostra uma cópia velha.

### Atualização ao voltar

Os hooks de dados usam `useFocusEffect` para recarregar sempre que a tela volta a ficar visível (por exemplo, ao voltar da retirada para o detalhe).

### Sessão persistente

- **Entrega 2:** o `AuthContext` guarda um usuário de exemplo escolhido pelo e-mail digitado no login, sem verificar senha (o enunciado exclui a autenticação desta etapa). Isso já permite demonstrar o porteiro e a matriz de permissões.
- **Entrega 3:** o `AuthContext` passa a escutar o Firebase Authentication, inicializado com persistência em AsyncStorage, de forma que a sessão sobrevive ao fechamento do app (RNF11). **O porteiro não muda.**

## Consequências

- **Ganho:** Proteção de rotas em um único arquivo.
- **Ganho:** Parâmetros visíveis no nome do arquivo (`[id].js`), fáceis de explicar.
- **Ganho:** A troca de usuário de exemplo para Firebase Authentication não altera nenhuma tela.
- **Custo:** Renomear ou mover um arquivo dentro de `app/` muda a rota; links precisam ser atualizados.
- **Custo:** Parâmetros de rota chegam sempre como texto; números precisam ser convertidos no destino.
