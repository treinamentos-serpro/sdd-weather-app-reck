# Verificação de Acessibilidade e Gates de Release

- **Data do registro:** 2026-09-30
- **Status:** bloqueado para release; avaliação manual WCAG 2.2 AA pendente.
- **Escopo:** fluxos de busca e consulta do Weather App, conforme NFR-02/NFR-03.

## Gates automatizados

| Verificação | Resultado | Evidência |
| --- | --- | --- |
| `pnpm lint` | Aprovado | Biome verificou os arquivos de `src/` e `tests/` sem erros. |
| `pnpm build` | Aprovado | TypeScript e build de produção Vite terminaram com código 0. |
| `pnpm test` | Aprovado | 18 arquivos e 70 testes passaram. |
| `pnpm exec playwright test --list` | Aprovado | 40 testes encontrados nos projetos Chromium, Edge, Firefox, WebKit e mobile. |
| `pnpm test:e2e` | Bloqueado pelo ambiente | Os browsers não iniciaram; Chromium reportou `libnspr4.so` ausente, Firefox sem executável instalado, e WebKit/mobile reportaram dependências nativas ausentes. Nenhuma assertion E2E foi executada. |

## Avaliação Manual WCAG 2.2 AA

Os itens abaixo **não foram verificados manualmente**. Não registrar como conformes até uma execução em browsers com ambiente gráfico e leitor de tela disponíveis.

| Critério | Status | Registro necessário |
| --- | --- | --- |
| Operação completa por teclado | Pendente | Navegadores/versões, fluxos percorridos e falhas encontradas. |
| Leitor de tela e mensagens dinâmicas | Pendente | Leitor/sistema/browser, anúncios de loading, vazio, erro e parcial. |
| Foco visível e ordem de foco | Pendente | Fluxos, controles e resultado da inspeção visual/teclado. |
| Contraste de texto, controles e foco | Pendente | Pares de cores medidos e resultado contra WCAG 2.2 AA. |

## Decisão de Release

Não aprovar release com este registro. Instalar/provisionar as dependências dos browsers, executar `pnpm test:e2e` em Chromium, Edge, Firefox, WebKit e mobile, completar a avaliação manual acima e atualizar este documento com resultados observados.