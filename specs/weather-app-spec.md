# Especificação de Produto — Weather App

## Status e escopo

Aplicação web responsiva, em pt-BR, para buscar uma cidade, consultar suas condições meteorológicas e a previsão de cinco dias, com alternância entre Celsius e Fahrenheit. Esta especificação define o contrato funcional da primeira versão. Os parâmetros marcados como **baseline proposto** precisam de aprovação do responsável pelo produto antes do lançamento.

Decisões confirmadas: Open-Meteo como fonte, hoje e os quatro dias seguintes, Celsius inicial, interface pt-BR, sem autenticação e sem persistência no servidor. Não haverá localização automática, favoritos, alertas ou notificações nesta versão. São baselines de produto propostos, ainda sujeitos a aprovação: limite e quantidade de resultados da busca, campos meteorológicos, ausência de persistência da unidade e comportamento de dados parciais.

## Requisitos funcionais

- **FR-01 — Buscar localidades:** permitir busca submetida por ação explícita (botão ou Enter). Remover espaços externos e normalizar o texto em Unicode NFC; aceitar nome da cidade e qualificadores de região/país. O limite proposto é de 100 pontos de código Unicode após a normalização. Não aceitar consulta vazia ou só com espaços. Exibir até 10 resultados, sem selecionar automaticamente.
- **FR-02 — Identificar resultados:** cada resultado deve mostrar cidade, subdivisão administrativa e país quando fornecidos pelo geocoding. Cidades homônimas permanecem como opções distintas. A cidade escolhida é a única usada na consulta meteorológica.
- **FR-03 — Exibir condições atuais:** apresentar temperatura (`temperature_2m`), sensação térmica (`apparent_temperature`), condição (`weather_code`), umidade relativa (`relative_humidity_2m`) e velocidade do vento (`wind_speed_10m`) do objeto `current` do Open-Meteo. Mapear os códigos WMO para descrições em pt-BR. Unidades: °C/°F, %, km/h.
- **FR-04 — Exibir previsão:** solicitar `timezone=auto` e apresentar cinco datas locais consecutivas, incluindo a data atual da localidade. Para cada data, mostrar condição (`weather_code`), mínima/máxima (`temperature_2m_min`/`temperature_2m_max`) e probabilidade máxima de precipitação (`precipitation_probability_max`) do objeto `daily`. Usar o fuso IANA retornado; não usar o fuso do dispositivo.
- **FR-05 — Alternar temperatura:** iniciar em Celsius e alternar sem nova chamada à API todas as temperaturas exibidas, inclusive sensação térmica e mínimas/máximas. Usar `°F = (°C × 9/5) + 32`; exibir temperatura arredondada ao inteiro mais próximo. Não persistir a unidade após recarregar a página (**baseline proposto**).
- **FR-06 — Estados de consulta:** mostrar carregamento durante cada requisição; distinguir sem resultados, erro, timeout e dados parciais. Iniciar uma busca nova não remove o clima da cidade atualmente selecionada; ao selecionar outra cidade, limpar imediatamente os dados anteriores. Apenas a resposta da busca submetida mais recentemente atualiza resultados; apenas a consulta da seleção atual atualiza o clima.
- **FR-07 — Dados e fonte:** exibir a hora de referência de `current.time` e a hora de conclusão da consulta, ambas formatadas no fuso da localidade. Exibir atribuição visível à Open-Meteo conforme os termos vigentes e informar que previsões podem mudar. Não apresentar dados de uma consulta anterior como se fossem da seleção atual.

## Critérios de aceite

- **AC-01 — Busca com resultados:** dada a consulta `São José`, ao submetê-la, o app envia o texto normalizado corretamente ao geocoding e apresenta no máximo 10 resultados retornados, cada um com cidade e país e, quando disponível, subdivisão administrativa. Nenhum resultado é selecionado automaticamente; não há chamada meteorológica antes da seleção.
- **AC-02 — Input inválido:** para input vazio ou composto apenas por espaços, o app não chama o geocoding, mantém o foco no campo e exibe `Digite uma cidade.`. Para input acima de 100 pontos de código Unicode, bloqueia o envio e exibe `Use até 100 caracteres para buscar uma cidade.`.
- **AC-03 — Caracteres especiais:** consultas como `São José`, `L'Haÿ-les-Roses` e nomes com hífen são enviadas como texto em Unicode NFC, sem interpretação como marcação ou código. Uma resposta de geocoding vazia exibe `Nenhuma cidade encontrada. Verifique a busca e tente novamente.`, preserva o input e não chama a API meteorológica.
- **AC-04 — Seleção e previsão:** ao selecionar um resultado, o nome e o país selecionados aparecem junto aos dados. Com fixture contendo fuso `America/Sao_Paulo` e cinco datas locais, são exibidos exatamente cinco dias, em ordem cronológica, com os campos definidos em FR-04. A requisição usa `timezone=auto`; a data não muda quando o fuso do dispositivo é diferente.
- **AC-05 — Resposta parcial:** se um campo estiver ausente, não finito ou fora do domínio (umidade/probabilidade fora de 0–100 ou velocidade do vento negativa), exibir `Indisponível` somente para esse campo e manter os demais válidos. Exibir `Alguns dados estão indisponíveis.` uma vez no estado da consulta. Se faltar uma data da previsão, manter a posição cronológica e exibir `Previsão indisponível` para aquele dia. Nunca substituir ausência por zero.
- **AC-06 — Falha e timeout:** erro HTTP, falha de rede, JSON inválido ou envelope sem os objetos/listas exigidos exibe mensagem apropriada ao passo (`Não foi possível buscar cidades. Tente novamente.` ou `Não foi possível carregar o clima. Tente novamente.`), encerra o carregamento e oferece nova tentativa manual. Campo individual ausente/inválido segue AC-05. Cada requisição tem timeout de 8 segundos (**baseline proposto**); ao excedê-lo, exibir `A consulta demorou mais que o esperado. Tente novamente.`. Não há repetição automática.
- **AC-07 — Corrida entre consultas:** se duas buscas forem submetidas em sequência, somente os resultados da última podem substituir a lista. Se uma nova cidade for selecionada durante o carregamento de outra, somente os dados da última seleção podem ser exibidos; a resposta anterior é descartada.
- **AC-08 — Unidades:** com dados de 20 °C, 0 °C e -10 °C, Celsius mostra `20 °C`, `0 °C` e `-10 °C`; Fahrenheit mostra `68 °F`, `32 °F` e `14 °F`. A alternância atualiza todos os campos de temperatura sem nova chamada à API; um novo carregamento inicia em Celsius (**baseline proposto**).
- **AC-09 — Acessibilidade e responsividade:** todos os fluxos acima podem ser concluídos por teclado; foco é visível, resultados são opções com nome acessível e mudanças de carregamento/erro/resultados são anunciadas por tecnologia assistiva. Não há rolagem horizontal entre 320 e 1920 CSS px.

Testes de integração devem usar respostas controladas do geocoding e da previsão para cobrir os critérios acima, incluindo sucesso, lista vazia, erro, timeout, dados parciais, fuso diferente do dispositivo e respostas fora de ordem.

## Requisitos não funcionais

- **NFR-01 — Idioma e formato:** conteúdo voltado ao usuário em pt-BR; números usam vírgula decimal quando houver casas decimais, datas e horas usam formatação pt-BR e relógio de 24 horas. Datas da previsão seguem o FR-04.
- **NFR-02 — Acessibilidade:** conformidade WCAG 2.2 AA nos fluxos de busca e consulta. Validar navegação por teclado, leitor de tela, foco, contraste e mensagens dinâmicas por verificação automatizada e manual.
- **NFR-03 — Compatibilidade:** suportar versões estáveis atuais e anteriores de Chrome, Edge, Firefox e Safari, em desktop e mobile; validar o fluxo principal em cada navegador e em 320 px e 1920 px.
- **NFR-04 — Desempenho (baseline proposto):** em teste com RTT de 100 ms, throughput de 10 Mbps e latência combinada das APIs de até 1,5 s, p95 entre envio da busca e exibição do clima deve ser ≤ 3 s. Medir carregamento inicial separadamente; não contar erro/timeout como consulta bem-sucedida.
- **NFR-05 — Disponibilidade (baseline proposto):** disponibilidade mensal da aplicação ≥ 99,5%, medida por sondas sintéticas. Medir e reportar separadamente falhas do Open-Meteo; falha do provedor deve resultar nos estados definidos em AC-06, nunca em dados falsamente atuais.
- **NFR-06 — Privacidade e segurança:** usar HTTPS. Não solicitar localização do dispositivo, não persistir cidade/unidade em armazenamento local ou servidor e não registrar consultas ou coordenadas em logs. A busca é enviada ao serviço de geocoding para processamento. Não embutir segredos de API no cliente.

## Histórias de usuário e rastreabilidade

| ID | User Story | Critérios de aceite | Requisitos não funcionais relevantes |
| --- | --- | --- | --- |
| US-01 | Como pessoa que planeja a rotina, quero buscar e selecionar uma cidade para consultar o local correto. | AC-01, AC-02, AC-03, AC-07 | NFR-01, NFR-02, NFR-03, NFR-04, NFR-06 |
| US-02 | Como pessoa que planeja a rotina, quero consultar as condições atuais da cidade selecionada para me preparar para o dia. | AC-04, AC-05, AC-06, AC-07, AC-09 | NFR-01, NFR-02, NFR-03, NFR-04, NFR-05, NFR-06 |
| US-03 | Como pessoa que planeja uma viagem, quero consultar hoje e os quatro dias seguintes no destino para planejar o que levar. | AC-04, AC-05, AC-06, AC-07, AC-09 | NFR-01, NFR-02, NFR-03, NFR-04, NFR-05, NFR-06 |
| US-04 | Como pessoa que prefere outra unidade, quero alternar Celsius e Fahrenheit para interpretar as temperaturas. | AC-08, AC-09 | NFR-01, NFR-02, NFR-03 |
| US-05 | Como pessoa em deslocamento, quero pesquisar e consultar a previsão pelo celular para adaptar meus planos às condições locais. | AC-01, AC-02, AC-03, AC-04, AC-05, AC-06, AC-07, AC-09 | NFR-01, NFR-02, NFR-03, NFR-04, NFR-05, NFR-06 |

## Estados e limites

- **Sem resultados:** resposta válida do geocoding com zero localidades; não é erro de API nem prova de que a cidade não existe fora da cobertura do provedor.
- **Erro:** falha HTTP, rede ou formato de resposta inválido; manter a busca editável e permitir repetição manual.
- **Timeout:** limite de 8 segundos por requisição, sem retry automático; manter a localidade selecionada para que o usuário possa repetir a consulta meteorológica.
- **Dados parciais:** cada campo é independente; valores ausentes ou inválidos são indisponíveis, nunca zero. Datas ausentes continuam identificadas no calendário da previsão.

## Out of Scope

- Aplicativos nativos; o produto é uma aplicação web responsiva.
- Contas, autenticação, perfis, histórico de buscas, favoritos, comparação de cidades ou sincronização entre dispositivos.
- Localização automática ou coleta de coordenadas do dispositivo.
- Busca por endereço, código postal ou coordenadas; a busca desta versão é por cidade, com qualificadores opcionais de região/país.
- Autocomplete enquanto o usuário digita; a busca ocorre por envio explícito.
- Previsões horárias, períodos acima de cinco dias, clima histórico ou seleção de intervalo de datas.
- Mapas, radar, satélite, alertas meteorológicos, notificações e avisos severos.
- Métricas além das condições atuais e dos campos diários definidos em FR-03/04, incluindo qualidade do ar, UV e pólen.
- Uso offline, garantias de precisão além dos dados do provedor, cache persistente ou exibição de dados antigos como substituto de falhas.
- Idiomas além de pt-BR.

## Aprovações necessárias antes do lançamento

- Aprovar a cobertura geográfica prioritária e validar que o geocoding do Open-Meteo atende a essas localidades; a interface não promete cobertura universal.
- Confirmar termos vigentes do provedor e o formato/link de atribuição exigidos.
- Aprovar os baselines de timeout, desempenho e disponibilidade em FR-06 e NFR-04/05; são metas propostas, não compromissos confirmados no discovery.