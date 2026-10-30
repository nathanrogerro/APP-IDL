# ADR 006 — Integração com a IA (Gemini via servidor intermediário no Render)

**Status:** Aceita · **Data:** 25/10 · **Implementação:** Entrega 3

## Resumo

No contexto de um app acadêmico executado no Expo Go, limitado a serviços gratuitos, diante da necessidade de chamar o Google Gemini para extrair os dados do rótulo **sem expor a chave da API**, decidimos por **um servidor intermediário pequeno hospedado no plano gratuito do Render, que guarda a chave e só atende usuários autenticados no Firebase**, para alcançar uma chave que nunca sai do servidor e proteção contra uso indevido da cota, aceitando lentidão na primeira chamada após inatividade e uma peça a mais para implantar e manter.

## Contexto

- O enunciado proíbe chaves de API **versionadas no repositório**.
- No Expo, toda variável lida pelo app precisa do prefixo `EXPO_PUBLIC_`, e o valor é **copiado para dentro do código JavaScript** do app. Uma chave guardada assim sai do repositório, mas viaja dentro do app e pode ser extraída por qualquer pessoa que tenha o app ou acesse o servidor de desenvolvimento.
- Com a chave, outra pessoa poderia consumir toda a cota gratuita do Gemini, e a funcionalidade de IA do LabSto pararia de responder.
- O plano gratuito do Firebase (Spark) **não permite Cloud Functions**.

## Alternativas consideradas

| # | Alternativa | Vantagem | Por que não |
|---|---|---|---|
| A | **Chave no app** (`EXPO_PUBLIC_GEMINI_KEY` no `.env`) | Simples; funciona no Expo Go | A chave pode ser extraída do app; qualquer um pode esgotar a cota |
| B | Servidor em **Cloud Functions** | Integração nativa com o Firebase | Exige o plano **Blaze** (com cartão cadastrado); contradiz a restrição de plano gratuito |
| C | **Firebase AI Logic** | Não expõe a chave do Gemini | A proteção contra abuso depende do App Check, que **não funciona no Expo Go**; o abuso de cota continua possível |
| D | Servidor no Render **sem autenticação** | Chave fora do app | O endereço do servidor fica no app; qualquer pessoa poderia chamá-lo e gastar a cota do mesmo jeito. O problema só mudaria de lugar |
| **E** | **Servidor no Render que exige token do Firebase** | Chave fora do app **e** só usuários do LabSto usam a cota | **Escolhida** |

## Solução

### Fluxo

```
App (usuário logado)
  │  1. tira a foto, comprime (≤ 500 KB, RNF08)
  │  2. POST /extrair-rotulo
  │     Authorization: Bearer <ID token do Firebase>
  │     { imagemBase64, mimeType }
  ▼
Servidor no Render (pasta server/ do repositório, Node + Express)
  │  3. verifica o token com firebase-admin  ── inválido → 401
  │  4. confere o limite diário do usuário   ── excedido → 429
  │  5. chama o Gemini com a chave (variável de ambiente)
  │     pedindo resposta em JSON com esquema definido
  │  6. valida a resposta                    ── fora do formato → 422
  ▼
App
  7. preenche o formulário com os campos como SUGESTÃO (RF09)
     Qualquer erro → mensagem + cadastro manual com os campos vazios (US03)
```

### Contrato da resposta

```json
{
  "campos": {
    "nome": "Solução Tampão pH 7,00",
    "concentracao": "0,05 M",
    "fabricante": "Labsynth",
    "lote": "2024-B90",
    "cas": null,
    "validade": "2027-10-15"
  }
}
```

Um campo que a IA não conseguiu ler vem como `null` e aparece vazio e sinalizado no formulário — nunca inventado (US03).

### Configuração

| Onde | Variável | Conteúdo |
|---|---|---|
| Render (painel) | `GEMINI_API_KEY` | Chave do Google AI Studio — **existe só aqui** |
| Render (painel) | `GEMINI_MODEL` | Modelo do Gemini com entrada de imagem disponível no plano gratuito |
| Render (painel) | `FIREBASE_PROJECT_ID` | Usado para validar os tokens |
| App (`.env`, fora do Git) | `EXPO_PUBLIC_IA_URL` | Endereço do servidor. **Não é segredo**: sem um token válido, o servidor recusa |

O repositório contém apenas `.env.example`, com os nomes das variáveis e sem valores.

### Mitigações complementares

1. **Projeto do Google dedicado ao LabSto, sem conta de faturamento**: o pior cenário é a cota acabar, nunca uma cobrança.
2. **Chave restrita**, no Google Cloud Console, apenas à API do Gemini.
3. **Limite de 30 extrações por usuário por dia** (RNF31), contado em memória no servidor.
4. **Tempo limite de 60 s** no app, com botão "Cancelar e preencher manualmente" (RNF02).
5. **Troca da chave** ao fim do semestre ou se houver suspeita de vazamento.

## Consequências

- **Ganho:** A chave do Gemini **não está no repositório nem no app** (RNF15).
- **Ganho:** Só usuários autenticados do LabSto conseguem consumir a cota (RNF31).
- **Ganho:** O servidor valida o formato da resposta antes de devolvê-la ao app, o que facilita atender à exigência de a IA "continuar utilizável quando a API falhar ou responder fora do formato esperado".
- **Custo:** **O servidor "dorme"** após 15 minutos sem uso no plano gratuito do Render; a primeira chamada depois disso pode levar até cerca de 1 minuto. Antes de demonstrações, o servidor deve ser acordado acessando seu endereço.
- **Custo:** O limite diário é perdido quando o servidor dorme ou reinicia. Aceitamos isso: o objetivo é conter abuso, não contabilidade exata.
- **Custo:** O servidor não verifica se o usuário foi **desativado** pelo Admin (isso exigiria acesso ao Firestore com credencial de serviço). Um usuário desativado com sessão aberta ainda poderia usar a IA até o token expirar (1 h).
- **Custo:** Mais uma peça para implantar e documentar. O enunciado permite back-end próprio "por conta e risco do grupo"; aqui o risco é pequeno, pois o Firebase continua sendo o back-end principal e o servidor tem uma única rota.
- **Observação:** No plano gratuito, o Google pode usar o conteúdo enviado para melhorar seus modelos. Fotos de rótulos de reagentes não contêm dados pessoais, então aceitamos esse termo.
