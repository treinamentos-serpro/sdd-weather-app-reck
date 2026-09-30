# Tarefas de Implementação — Weather App

As entregas seguem a ordem de implementação das camadas. Dependências apontam somente para tarefas anteriores. Baselines propostos na spec permanecem ajustáveis até aprovação para lançamento.

Prioridade indica ordem de entrega: **P0** compõe a primeira fatia utilizável; **P1** completa verificação funcional e gates pré-release; **P2** é hardening de compatibilidade ampliada, ainda necessário antes do lançamento quando requerido. Tamanho relativo: **P** é escopo localizado, **M** envolve integração ou vários casos, **G** cruza camadas ou concentra validação abrangente.

## Rastreabilidade de requisitos funcionais

| Requisito da spec | Tarefas de implementação | Tarefas de verificação |
| --- | --- | --- |
| FR-01 — Buscar localidades | T-02, T-08, T-10, T-11 | T-21, T-25, T-28, T-34 |
| FR-02 — Identificar resultados | T-03, T-08, T-12 | T-21, T-25, T-28, T-34 |
| FR-03 — Exibir condições atuais | T-04, T-06, T-09, T-14 | T-22, T-24, T-26, T-30, T-34 |
| FR-04 — Exibir previsão | T-04, T-06, T-07, T-09, T-15 | T-22, T-24, T-26, T-30, T-34, T-35 |
| FR-05 — Alternar temperatura | T-05, T-10, T-16 | T-23, T-27, T-31, T-34 |
| FR-06 — Estados de consulta | T-10, T-13 | T-27, T-29, T-35, T-36 |
| FR-07 — Dados e fonte | T-07, T-09, T-14, T-17 | T-24, T-30, T-32, T-34 |

**Cobertura:** todos os requisitos funcionais FR-01 a FR-07 têm tarefas de implementação e verificação correspondentes. FR-07 é coberto pela formatação e exibição de `observedAt`/`fetchedAt` (T-07, T-09, T-14) e pela atribuição/aviso ao provedor (T-17). Não há requisito funcional sem tarefa correspondente.

## Entrega 1 — Tipos

### T-01 [P0/M] — Definir os tipos de domínio

- **Descrição:** declarar os contratos internos de cidade, clima, forecast, unidade, erro e estado assíncrono.
- **Critérios de aceite:** `City`, `CurrentWeather`, `ForecastDay`, `WeatherData`, `Unit`, `RequestError` e `AsyncState` correspondem ao modelo do plano; temperaturas canônicas são Celsius; forecast contém cinco posições; campos meteorológicos opcionais aceitam `null`.
- **Dependências:** nenhuma.
- **Arquivos prováveis:** `src/types/weather.ts`.
- **Tipo:** Data.
- **Rastreabilidade:** FR-02, FR-03, FR-04, FR-05, FR-06.

## Entrega 2 — Funções puras

### T-02 [P0/P] — Normalizar a consulta de cidade

- **Descrição:** implementar trim, normalização Unicode NFC e validação local do input.
- **Critérios de aceite:** `''` e strings só com espaços retornam inválido; `'  São José  '` retorna texto NFC sem espaços externos; 100 pontos de código são aceitos e 101 rejeitados; a função não acessa DOM nem rede.
- **Dependências:** T-01.
- **Arquivos prováveis:** `src/lib/normalizeCityQuery.ts`.
- **Tipo:** Data.
- **Rastreabilidade:** FR-01, AC-02, AC-03.

### T-03 [P0/M] — Mapear respostas de geocoding

- **Descrição:** converter o envelope externo de geocoding em cidades internas.
- **Critérios de aceite:** fixture com os campos da API produz os campos correspondentes de `City`; metadados ausentes produzem `null`; coordenadas não finitas e envelope inválido retornam erro; `results: []` retorna lista vazia.
- **Dependências:** T-01.
- **Arquivos prováveis:** `src/lib/parseGeocodingResponse.ts`.
- **Tipo:** Data.
- **Rastreabilidade:** FR-01, FR-02, AC-01, AC-03.

### T-04 [P0/M] — Mapear respostas de forecast

- **Descrição:** normalizar `current` e arrays paralelos `daily` para `WeatherData`.
- **Critérios de aceite:** fixture completa produz cinco posições na ordem de `daily.time`; valores individuais ausentes/não finitos viram `null`; uma data diária ausente é preenchida pela sequência local consecutiva iniciada em `current.time` no timezone retornado, sem deslocar outros dias, e marca `isPartial`; envelope sem estruturas obrigatórias retorna erro.
- **Dependências:** T-01.
- **Arquivos prováveis:** `src/lib/parseForecastResponse.ts`.
- **Tipo:** Data.
- **Rastreabilidade:** FR-03, FR-04, AC-04, AC-05, AC-06.

### T-05 [P0/P] — Converter valores de temperatura

- **Descrição:** implementar conversão pura entre Celsius e Fahrenheit.
- **Critérios de aceite:** Celsius→Fahrenheit retorna 68, 32 e 14 para 20, 0 e -10; valores nulos permanecem nulos; arredondamento segue FR-05.
- **Dependências:** T-01.
- **Arquivos prováveis:** `src/lib/convertTemperature.ts`.
- **Tipo:** Data.
- **Rastreabilidade:** FR-05, AC-08.

### T-06 [P0/P] — Mapear códigos meteorológicos

- **Descrição:** traduzir códigos WMO em rótulos pt-BR.
- **Critérios de aceite:** códigos 0, 1, 3, 45, 61, 71, 80 e 95 retornam descrições não vazias em pt-BR; código fora da tabela retorna indisponível sem exceção.
- **Dependências:** T-01.
- **Arquivos prováveis:** `src/lib/mapWeatherCode.ts`.
- **Tipo:** Data.
- **Rastreabilidade:** FR-03, FR-04.

### T-07 [P0/P] — Formatar datas e números

- **Descrição:** criar formatadores puros para datas/horas no timezone recebido e números em pt-BR.
- **Critérios de aceite:** fixture `2026-09-30T09:00` em `America/Sao_Paulo` produz `09:00` independentemente do timezone do processo; 18.5 é exibido com vírgula decimal (`18,5`).
- **Dependências:** T-01.
- **Arquivos prováveis:** `src/lib/formatWeather.ts`.
- **Tipo:** Data.
- **Rastreabilidade:** FR-04, FR-07, NFR-01.

## Entrega 3 — Services

### T-08 [P0/M] — Implementar o service de geocoding

- **Descrição:** encapsular chamada, parâmetros, cancelamento e erros do endpoint de busca.
- **Critérios de aceite:** a request usa `name`, `count=10`, `language=pt` e `format=json` via `URLSearchParams`; encaminha `AbortSignal`; sucesso retorna `City[]`; HTTP, rede, timeout e resposta inválida retornam `RequestError` tipado.
- **Dependências:** T-02, T-03.
- **Arquivos prováveis:** `src/services/openMeteoService.ts`.
- **Tipo:** Data.
- **Rastreabilidade:** FR-01, FR-02, AC-01, AC-03, AC-06.

### T-09 [P0/M] — Implementar o service de forecast

- **Descrição:** encapsular a chamada meteorológica para a cidade selecionada.
- **Critérios de aceite:** a request envia latitude/longitude, todos os campos `current`/`daily` do plano, `timezone=auto`, `forecast_days=5`, Celsius e km/h; encaminha `AbortSignal`; sucesso retorna `WeatherData` normalizado.
- **Dependências:** T-01, T-04.
- **Arquivos prováveis:** `src/services/openMeteoService.ts`.
- **Tipo:** Data.
- **Rastreabilidade:** FR-03, FR-04, FR-07, AC-04, AC-05, AC-06.

## Entrega 4 — Hook e estado

### T-10 [P0/G] — Implementar o hook da aplicação

- **Descrição:** coordenar busca, seleção, forecast, unidade e concorrência em `useWeatherApp`.
- **Critérios de aceite:** busca e clima iniciam em `idle`; submit inicia `loading`; lista vazia termina em `empty`; seleção inicia forecast em `loading` e limpa dados antigos; busca nova preserva clima atual; respostas obsoletas não alteram estado; unidade inicia em Celsius.
- **Dependências:** T-01, T-08, T-09.
- **Arquivos prováveis:** `src/hooks/useWeatherApp.ts`.
- **Tipo:** UI.
- **Rastreabilidade:** FR-01, FR-05, FR-06, AC-03, AC-07, AC-08.

## Entrega 5 — Componentes

### T-11 [P0/M] — Criar o formulário de busca

- **Descrição:** implementar input, envio por botão/Enter e validação local.
- **Critérios de aceite:** o campo tem nome acessível; Enter e botão submetem uma vez; vazio/101 caracteres não chamam busca e exibem os textos de AC-02; consulta acentuada é preservada; foco permanece no input após validação inválida.
- **Dependências:** T-02, T-10.
- **Arquivos prováveis:** `src/components/SearchForm.tsx`.
- **Tipo:** UI.
- **Rastreabilidade:** FR-01, AC-02, AC-03, AC-09.

### T-12 [P0/P] — Exibir resultados selecionáveis

- **Descrição:** apresentar localidades retornadas para seleção explícita.
- **Critérios de aceite:** cada fixture exibe nome e país, e subdivisão quando não nula; nenhum resultado é selecionado na renderização inicial; resultados têm nome acessível e são selecionáveis por teclado.
- **Dependências:** T-01, T-10.
- **Arquivos prováveis:** `src/components/CityResults.tsx`.
- **Tipo:** UI.
- **Rastreabilidade:** FR-02, AC-01, AC-09.

### T-13 [P0/M] — Exibir estados da consulta

- **Descrição:** renderizar feedback de carregamento, vazio, erro, timeout e parcialidade.
- **Critérios de aceite:** os estados exibem os textos definidos em AC-02/03/05/06; status usa região live; retry de geocoding e forecast chama a ação correspondente.
- **Dependências:** T-10.
- **Arquivos prováveis:** `src/components/QueryStatus.tsx`.
- **Tipo:** UI.
- **Rastreabilidade:** FR-06, AC-02, AC-03, AC-05, AC-06, AC-09.

### T-14 [P0/M] — Renderizar condições atuais

- **Descrição:** apresentar os campos de `CurrentWeather` e disponibilidade por campo.
- **Critérios de aceite:** fixture verifica temperatura, sensação térmica, condição, umidade e vento; `null` aparece como `Indisponível`; código conhecido usa rótulo pt-BR; unidades exibidas correspondem aos dados; `observedAt` (`current.time`) e `fetchedAt` aparecem com rótulos distintos e horário `pt-BR` no timezone de `WeatherData`.
- **Dependências:** T-01, T-06, T-07, T-10.
- **Arquivos prováveis:** `src/components/CurrentWeather.tsx`.
- **Tipo:** UI.
- **Rastreabilidade:** FR-03, FR-07, AC-05.

### T-15 [P0/M] — Renderizar a previsão de cinco dias

- **Descrição:** exibir cinco posições de forecast na ordem e timezone locais.
- **Critérios de aceite:** fixture renderiza exatamente cinco itens na ordem de `localDate`; cada item contém condição, mínima, máxima e probabilidade; timezone do dispositivo não altera datas; dia indisponível mostra `Previsão indisponível`.
- **Dependências:** T-01, T-04, T-06, T-07, T-10.
- **Arquivos prováveis:** `src/components/ForecastList.tsx`.
- **Tipo:** UI.
- **Rastreabilidade:** FR-04, AC-04, AC-05.

### T-16 [P0/P] — Criar o controle de unidade

- **Descrição:** permitir selecionar Celsius ou Fahrenheit e atualizar o estado do hook.
- **Critérios de aceite:** Celsius inicia selecionado; controles têm nomes acessíveis e suporte a teclado; cada seleção chama a callback uma vez e não chama service.
- **Dependências:** T-01, T-10.
- **Arquivos prováveis:** `src/components/UnitToggle.tsx`.
- **Tipo:** UI.
- **Rastreabilidade:** FR-05, AC-08, AC-09.

### T-17 [P0/P] — Exibir atribuição do provedor

- **Descrição:** criar atribuição visível à Open-Meteo e aviso sobre mudanças da previsão.
- **Critérios de aceite:** DOM contém link visível com nome acessível Open-Meteo e o aviso de previsão variável; texto e destino finais são conferidos com os termos aprovados.
- **Dependências:** T-01.
- **Arquivos prováveis:** `src/components/Attribution.tsx`.
- **Tipo:** UI.
- **Rastreabilidade:** FR-07.

### T-18 [P0/M] — Aplicar estilos responsivos

- **Descrição:** implementar layout global seguindo os breakpoints e o tema do projeto.
- **Critérios de aceite:** nos viewports de 320, 768 e 1920 CSS px, `document.documentElement.scrollWidth <= window.innerWidth`; busca, resultados e forecast não se sobrepõem; foco de teclado permanece visível.
- **Dependências:** T-11, T-12, T-13, T-14, T-15, T-16, T-17.
- **Arquivos prováveis:** `src/index.css`.
- **Tipo:** UI.
- **Rastreabilidade:** AC-09, NFR-02, NFR-03.

## Entrega 6 — Integração

### T-19 [P0/M] — Compor e iniciar a aplicação

- **Descrição:** criar a entrada React e conectar hook e componentes por props/callbacks, sem acesso direto à rede na composição.
- **Critérios de aceite:** `pnpm build` termina com código 0; a entrada monta `App`; o teste de composição confirma busca, feedback, clima, previsão, unidade e atribuição; `App` usa o hook e não chama `fetch`.
- **Dependências:** T-10, T-11, T-12, T-13, T-14, T-15, T-16, T-17, T-18.
- **Arquivos prováveis:** `src/main.tsx`, `src/App.tsx`.
- **Tipo:** UI.
- **Rastreabilidade:** FR-01 a FR-07.

## Entrega 7 — Testes

### T-20 [P0/P] — Configurar o setup de testes

- **Descrição:** fornecer setup global de Vitest e Testing Library referenciado pela configuração do projeto.
- **Critérios de aceite:** `pnpm test -- tests/unit/setup.test.ts` termina com código 0; o teste confirma `toBeInTheDocument()` e `document.body` disponível.
- **Dependências:** T-19.
- **Arquivos prováveis:** `tests/setup.ts`, `tests/unit/setup.test.ts`.
- **Tipo:** Infra.
- **Rastreabilidade:** infraestrutura para verificar AC-01 a AC-09.

### T-21 [P0/M] — Testar consulta e parser de cidades

- **Descrição:** testar normalização da busca e mapeamento de geocoding.
- **Critérios de aceite:** Vitest asserta input vazio, limites 100/101, NFC/acentos, mapeamento, metadados nulos, lista vazia, coordenada não finita e envelope inválido.
- **Dependências:** T-02, T-03, T-20.
- **Arquivos prováveis:** `tests/unit/lib/normalizeCityQuery.test.ts`, `tests/unit/lib/parseGeocodingResponse.test.ts`.
- **Tipo:** Test.
- **Rastreabilidade:** AC-01, AC-02, AC-03.

### T-22 [P0/M] — Testar o parser de forecast

- **Descrição:** testar a normalização de clima atual e forecast diário.
- **Critérios de aceite:** fixtures assertam timezone, timestamp, alinhamento por índice, cinco posições, campo ausente, dia ausente preenchido na data local correta, `isPartial` e erro para envelope inválido.
- **Dependências:** T-04, T-20.
- **Arquivos prováveis:** `tests/unit/lib/parseForecastResponse.test.ts`.
- **Tipo:** Test.
- **Rastreabilidade:** AC-04, AC-05, AC-06.

### T-23 [P0/P] — Testar conversão de unidade

- **Descrição:** testar isoladamente a conversão Celsius/Fahrenheit.
- **Critérios de aceite:** assertions verificam 20→68, 0→32 e -10→14; conversão reversa retorna os valores Celsius esperados; `null` permanece `null`; arredondamento corresponde à regra FR-05.
- **Dependências:** T-05, T-20.
- **Arquivos prováveis:** `tests/unit/lib/convertTemperature.test.ts`.
- **Tipo:** Test.
- **Rastreabilidade:** FR-05, AC-08.

### T-24 [P0/M] — Testar mapeamento WMO e formatadores

- **Descrição:** verificar rótulos WMO e formatação pt-BR de data, hora e números.
- **Critérios de aceite:** códigos conhecidos retornam rótulos não vazios e código desconhecido retorna indisponível; fixture fixa hora `09:00` em `America/Sao_Paulo` com timezone de execução diferente e verifica vírgula decimal em 18,5.
- **Dependências:** T-06, T-07, T-20.
- **Arquivos prováveis:** `tests/unit/lib/mapWeatherCode.test.ts`, `tests/unit/lib/formatWeather.test.ts`.
- **Tipo:** Test.
- **Rastreabilidade:** NFR-01, AC-04.

### T-25 [P0/M] — Testar o service de geocoding

- **Descrição:** validar chamada e erros de busca com `fetch` mockado.
- **Critérios de aceite:** assertions verificam URL/parâmetros, sucesso, vazio, HTTP não-2xx, rede, JSON/envelope inválido, timeout de 8 s e cancelamento; nenhum teste acessa a API real.
- **Dependências:** T-08, T-20.
- **Arquivos prováveis:** `tests/unit/services/geocodingService.test.ts`.
- **Tipo:** Test.
- **Rastreabilidade:** AC-01, AC-03, AC-06.

### T-26 [P0/M] — Testar o service de forecast

- **Descrição:** validar chamada e erros meteorológicos com `fetch` mockado.
- **Critérios de aceite:** assertions verificam todos os parâmetros de forecast, resposta `WeatherData`, HTTP/rede, JSON/envelope inválido, timeout de 8 s e cancelamento; nenhum teste acessa a API real.
- **Dependências:** T-09, T-20.
- **Arquivos prováveis:** `tests/unit/services/forecastService.test.ts`.
- **Tipo:** Test.
- **Rastreabilidade:** AC-04, AC-05, AC-06.

### T-27 [P0/M] — Testar o hook e suas transições

- **Descrição:** testar máquina de estados e concorrência com services simulados.
- **Critérios de aceite:** assertions cobrem idle/loading/success/empty/error, parcialidade em success, retry, preservação do clima durante busca nova, limpeza ao selecionar outra cidade e descarte de resposta obsoleta.
- **Dependências:** T-10, T-20.
- **Arquivos prováveis:** `tests/unit/hooks/useWeatherApp.test.ts`.
- **Tipo:** Test.
- **Rastreabilidade:** AC-03, AC-05, AC-06, AC-07.

### T-28 [P0/M] — Testar busca e resultados

- **Descrição:** testar interação e acessibilidade do formulário e resultados.
- **Critérios de aceite:** Testing Library asserta submit por Enter/botão, validação, conteúdo/nome acessível, seleção por teclado e callback chamado uma vez; `fetch` não é invocado.
- **Dependências:** T-11, T-12, T-20.
- **Arquivos prováveis:** `tests/unit/components/SearchForm.test.tsx`, `tests/unit/components/CityResults.test.tsx`.
- **Tipo:** Test.
- **Rastreabilidade:** AC-01, AC-02, AC-03, AC-09.

### T-29 [P0/M] — Testar feedback da consulta

- **Descrição:** testar mensagens e ações dos estados de consulta.
- **Critérios de aceite:** loading, success, vazio e parcial têm `role="status"`; erro tem `role="alert"`; textos correspondem a AC-02/03/05/06; retries de geocoding e forecast chamam callbacks distintos.
- **Dependências:** T-13, T-20.
- **Arquivos prováveis:** `tests/unit/components/QueryStatus.test.tsx`.
- **Tipo:** Test.
- **Rastreabilidade:** AC-02, AC-03, AC-05, AC-06, AC-09.

### T-30 [P0/M] — Testar componentes meteorológicos

- **Descrição:** validar exibição do clima atual e previsão diária.
- **Critérios de aceite:** fixtures assertam campos atuais/diários, cinco datas em ordem, rótulo WMO, unidades, `null` como `Indisponível`, dia incompleto como `Previsão indisponível` e exibição de `observedAt`/`fetchedAt` formatados no timezone dos dados.
- **Dependências:** T-14, T-15, T-20.
- **Arquivos prováveis:** `tests/unit/components/CurrentWeather.test.tsx`, `tests/unit/components/ForecastList.test.tsx`.
- **Tipo:** Test.
- **Rastreabilidade:** AC-04, AC-05.

### T-31 [P0/P] — Testar o controle de unidade

- **Descrição:** validar interação acessível para alternar Celsius/Fahrenheit.
- **Critérios de aceite:** Testing Library seleciona os dois controles por role/nome, verifica unidade ativa e callback; spy confirma zero chamadas a services/fetch ao alternar.
- **Dependências:** T-16, T-20.
- **Arquivos prováveis:** `tests/unit/components/UnitToggle.test.tsx`.
- **Tipo:** Test.
- **Rastreabilidade:** AC-08, AC-09.

### T-32 [P0/P] — Testar atribuição

- **Descrição:** verificar o link e aviso apresentados pelo componente de atribuição.
- **Critérios de aceite:** o teste encontra link visível com nome acessível Open-Meteo e o aviso de previsão variável; destino/texto são os aprovados nos termos vigentes.
- **Dependências:** T-17, T-20.
- **Arquivos prováveis:** `tests/unit/components/Attribution.test.tsx`.
- **Tipo:** Test.
- **Rastreabilidade:** FR-07.

### T-33 [P0/M] — Testar integração da tela

- **Descrição:** verificar composição de `App` com o hook e componentes reais.
- **Critérios de aceite:** teste confirma busca, feedback inicial, unidade, atribuição e dados após selecionar fixture; mock de service verifica que a composição não chama `fetch` diretamente.
- **Dependências:** T-19, T-28, T-29, T-30, T-31, T-32.
- **Arquivos prováveis:** `tests/unit/components/App.test.tsx`.
- **Tipo:** Test.
- **Rastreabilidade:** FR-01 a FR-07, AC-01 a AC-09.

### T-34 [P0/G] — Testar fluxo principal desktop e mobile ponta a ponta

- **Descrição:** automatizar o fluxo principal completo em desktop e mobile.
- **Critérios de aceite:** Playwright percorre busca→resultados→seleção→forecast→alternância com APIs interceptadas no projeto Chromium desktop e no projeto iPhone; verifica metadados, cinco dias, timestamps `observedAt`/`fetchedAt`, zero requests de forecast antes da seleção e nenhuma nova request ao alternar unidade.
- **Dependências:** T-19, T-28, T-29, T-30, T-31, T-33.
- **Arquivos prováveis:** `tests/e2e/weather-flow.spec.ts`.
- **Tipo:** Test.
- **Rastreabilidade:** AC-01, AC-04, AC-08, AC-09, NFR-03.

### T-35 [P0/M] — Testar estados vazios e falhas ponta a ponta

- **Descrição:** testar vazio, erro, timeout e resposta parcial ponta a ponta.
- **Critérios de aceite:** cenários assertam as mensagens AC-03/05/06 para lista vazia, erro de API, timeout aos 8 s e forecast parcial; retry manual gera exatamente uma nova request.
- **Dependências:** T-19, T-29, T-30, T-33.
- **Arquivos prováveis:** `tests/e2e/query-states.spec.ts`.
- **Tipo:** Test.
- **Rastreabilidade:** AC-03, AC-05, AC-06.

### T-36 [P1/M] — Testar respostas concorrentes ponta a ponta

- **Descrição:** cobrir respostas concorrentes com APIs interceptadas.
- **Critérios de aceite:** atrasar a primeira resposta e liberar a segunda antes; ao final, resultados e clima exibem exclusivamente a segunda busca/seleção.
- **Dependências:** T-19, T-34, T-35.
- **Arquivos prováveis:** `tests/e2e/request-races.spec.ts`.
- **Tipo:** Test.
- **Rastreabilidade:** AC-07.

### T-37 [P0/M] — Testar viewport responsivo ponta a ponta

- **Descrição:** verificar layout responsivo nos viewports requeridos.
- **Critérios de aceite:** Playwright verifica `scrollWidth <= innerWidth` nas larguras 320, 768 e 1920 CSS px; no projeto iPhone, controles de busca/unidade são operáveis por toque e forecast permanece alcançável.
- **Dependências:** T-18, T-34.
- **Arquivos prováveis:** `tests/e2e/mobile-layout.spec.ts`.
- **Tipo:** Test.
- **Rastreabilidade:** AC-09, NFR-02, NFR-03.

### T-38 [P2/M] — Configurar matriz Playwright

- **Descrição:** adicionar projetos Playwright para os navegadores suportados e manter projeto mobile.
- **Critérios de aceite:** `playwright.config.ts` lista Chromium, Edge, Firefox e WebKit desktop e ao menos um projeto mobile; `pnpm exec playwright test --list` termina com código 0 e lista cada projeto.
- **Dependências:** T-36, T-37.
- **Arquivos prováveis:** `playwright.config.ts`.
- **Tipo:** Infra.
- **Rastreabilidade:** NFR-03.

## Entrega 8 — Hardening

### T-39 [P1/G] — Executar gates de entrega

- **Descrição:** executar os comandos de qualidade e registrar verificação manual de acessibilidade antes do release.
- **Critérios de aceite:** `pnpm lint`, `pnpm build`, `pnpm test` e `pnpm test:e2e` terminam com código 0; `docs/accessibility-verification.md` registra data, navegadores, teclado, leitor de tela, foco e contraste avaliados conforme WCAG 2.2 AA.
- **Dependências:** T-20, T-21, T-22, T-23, T-24, T-25, T-26, T-27, T-28, T-29, T-30, T-31, T-32, T-33, T-34, T-35, T-36, T-37, T-38.
- **Arquivos prováveis:** `docs/accessibility-verification.md`.
- **Tipo:** Infra.
- **Rastreabilidade:** NFR-02, NFR-03.

## Sequência sugerida em fatias verticais

1. **Fatia 1 — Primeira consulta utilizável (P0):** concluir T-01 a T-19 na ordem de dependência. A fatia termina com uma pessoa buscando e selecionando uma cidade, vendo condições atuais e cinco dias, alternando unidade e recebendo feedback de estados. É o primeiro incremento visível; usar fixtures durante a composição quando um endpoint ainda não estiver pronto, substituindo-as pela integração real antes de fechar T-19.
2. **Fatia 2 — Confiança do fluxo (P0):** concluir T-20 a T-35 e T-37. Cobre funções/services/hooks/componentes com Vitest, integra a tela, testa o fluxo principal nos viewports desktop/mobile e valida estados de erro/vazio/parcial.
3. **Fatia 3 — Hardening e release (P1/P2):** concluir T-36, T-38 e T-39. Verifica concorrência, matriz ampliada de navegadores e gates finais. P2 não significa opcional: a matriz continua necessária para atender NFR-03 antes do lançamento.

## Prompt de implementação — T-01

Copie o prompt abaixo para o Coding Agent no próximo módulo:

```text
Implemente somente a tarefa T-01 — Definir os tipos de domínio — para o Weather App.

Contexto
- A aplicação usa TypeScript strict, React/Vite e Open-Meteo. A spec é a fonte da verdade; o Data Model de `plans/weather-app-plan.md` define os contratos internos normalizados.
- As temperaturas são armazenadas canonicamente em Celsius. Ausência ou valor inválido de campo meteorológico é representado por null, nunca por zero.
- `src/` ainda não existe. O escopo desta tarefa é apenas o arquivo `src/types/weather.ts`.

Contrato a declarar
- `Unit = 'celsius' | 'fahrenheit'`.
- `City`: `id: number | null`, `name: string`, `admin1: string | null`, `country: string | null`, `countryCode: string | null`, `latitude: number`, `longitude: number`.
- `CurrentWeather`: `observedAt: string | null`, `temperatureC: number | null`, `apparentTemperatureC: number | null`, `weatherCode: number | null`, `relativeHumidity: number | null`, `windSpeedKmh: number | null`.
- `ForecastDay`: `localDate: string`, `weatherCode: number | null`, `temperatureMinC: number | null`, `temperatureMaxC: number | null`, `precipitationProbabilityMax: number | null`.
- `WeatherData`: `city: City`, `timezone: string`, `fetchedAt: string`, `current: CurrentWeather`, `forecast` como tupla de exatamente cinco `ForecastDay`, `isPartial: boolean`.
- `RequestErrorKind = 'network' | 'http' | 'timeout' | 'invalid-response'`.
- `RequestError`: `kind: RequestErrorKind`, `statusCode?: number`.
- `AsyncState<T>` como união discriminada dos estados `{ status: 'idle' }`, `{ status: 'loading' }`, `{ status: 'success'; data: T }`, `{ status: 'empty' }` e `{ status: 'error'; error: RequestError }`.

Critérios de aceite
1. Todos os tipos acima são exportados de `src/types/weather.ts` com os nomes, propriedades e nullabilidade especificados.
2. `Unit` aceita somente os literais `'celsius'` e `'fahrenheit'`.
3. `WeatherData.forecast` exige exatamente cinco posições; não substitua a tupla por um array de tamanho arbitrário.
4. `AsyncState<T>` é discriminado por `status` e cada variante expõe apenas os dados definidos acima.
5. Propriedades e contratos têm comentários curtos em pt-BR; nomes de identificadores permanecem em inglês.
6. O arquivo compila em TypeScript strict sem `any` e sem dependências de runtime.

Arquivos
- Criar somente `src/types/weather.ts`.
- Não criar componentes, hooks, services, testes, configuração ou outros arquivos; não antecipar tarefas posteriores.

Validação
- Execute `pnpm exec tsc --noEmit --strict --skipLibCheck --target ES2022 --module ESNext --moduleResolution bundler src/types/weather.ts` e informe o resultado.
- Não use `pnpm build` como critério desta tarefa: o ponto de entrada da aplicação será criado em tarefa posterior e ainda não existe.
- Ao concluir, informe o arquivo alterado, os tipos exportados e o comando de validação executado.
```
