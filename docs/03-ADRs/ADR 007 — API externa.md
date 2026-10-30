# ADR 007 — API externa: PubChem

**Status:** Aceita · **Data:** 25/10 · **Implementação:** Entrega 3

## Resumo

No contexto de um inventário de laboratório que precisa consumir ao menos uma API externa, diante da necessidade de escolher uma API **útil para o usuário** e que não exija chave nem custo, decidimos por consultar a **PubChem (NIH)** no detalhe de reagentes, buscando pelo **número CAS** e guardando a resposta em cache local, para alcançar dados de segurança do reagente sem digitação, aceitando que a busca por nome em português nem sempre encontra o composto.

## Contexto

- O enunciado exige o consumo de ao menos uma API externa, com tratamento de erro e indicação de carregamento. A IA (Gemini) não foi contada para esse requisito, para não depender de uma única integração.
- Quem manuseia um reagente precisa saber se ele é inflamável, corrosivo ou tóxico. Essa informação existe em bases públicas, mas hoje ninguém a consulta antes de usar.

## Alternativas consideradas

| # | Alternativa | Por que não |
|---|---|---|
| A | **BrasilAPI (feriados)**, para avisar quando a devolução cai em feriado | Gratuita e simples, mas pouco útil no fluxo principal |
| B | **ChemSpider** (Royal Society of Chemistry) | Exige cadastro e chave de API, voltando ao problema da [ADR-006](ADR-006-Integracao-com-a-IA.md) |
| C | Usar o próprio **Gemini** para descrever o reagente | A LLM pode inventar dados de segurança; para perigo químico, a fonte precisa ser uma base oficial |
| **D** | **PubChem PUG REST** | **Escolhida** — gratuita, sem chave, mantida pelo NIH, com dados de perigo GHS |

## Solução

### O que é consultado

| Informação | Endpoint (base `https://pubchem.ncbi.nlm.nih.gov/rest`) |
|---|---|
| Fórmula, massa molar, nome IUPAC e CID | `/pug/compound/name/{CAS ou nome}/property/MolecularFormula,MolecularWeight,IUPACName/JSON` |
| Classificação de perigo GHS (pictogramas) | `/pug_view/data/compound/{CID}/JSON?heading=GHS+Classification` |

### Regras

1. A consulta é feita **apenas para itens do tipo reagente**, ao abrir o detalhe.
2. Busca **pelo número CAS** quando informado; sem CAS, tenta pelo nome. A PubChem indexa nomes em inglês, então "Acetona" pode não ser encontrada, mas o CAS `67-64-1` é, porque é um identificador único e internacional do composto. Por isso o CAS foi acrescentado ao cadastro (RF07) e à extração por IA (RF08).
3. A resposta é guardada em uma tabela de **cache local** no SQLite (`cache_pubchem`, chave = CAS ou nome), válida por 30 dias. Ela não é sincronizada com o Firestore.
4. Os códigos de pictograma (GHS02, GHS05...) são traduzidos para português por uma tabela fixa no app ("Inflamável", "Corrosivo"...).
5. A chamada fica em `services/pubchemService.js` ([ADR-004](ADR-004-Arquitetura-em-camadas.md)).

### Estados na tela de detalhe

| Situação | O que aparece na seção "Dados do reagente" |
|---|---|
| Carregando | Indicador de carregamento só na seção; o restante do detalhe já está visível |
| Sucesso | Fórmula, massa molar e pictogramas GHS, com o link "Ver na PubChem" |
| 404 (não encontrado) | "Composto não encontrado na PubChem. Informe o número CAS para melhorar a busca." |
| Sem conexão / tempo limite (10 s) | "Não foi possível consultar a PubChem." + "Tentar novamente" |
| Item não é reagente | A seção não aparece |

## Consequências

- **Ganho:** Informação de segurança útil no fluxo do usuário, sem digitação e sem custo.
- **Ganho:** Nenhuma chave de API envolvida.
- **Ganho:** Com o cache, abrir o mesmo reagente de novo não gera outra chamada e funciona sem internet.
- **Custo:** Sem CAS e com nome em português, a consulta pode falhar; a mensagem orienta o usuário a informar o CAS.
- **Custo:** A PubChem limita a 5 requisições por segundo; o uso do app (uma consulta por abertura de detalhe, com cache) fica muito abaixo disso.
- **Custo:** Os dados vêm em inglês; apenas os pictogramas são traduzidos.
