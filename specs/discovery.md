# Análise de Discovery — Aplicação de Previsão do Tempo

## Contexto

A empresa solicitou uma aplicação para consulta meteorológica. O briefing exige busca de cidades, visualização do clima atual e da previsão de cinco dias, alternância entre Celsius e Fahrenheit e uso em dispositivos móveis.

O briefing não define público-alvo, cobertura geográfica, conteúdo meteorológico, critérios de sucesso nem metas de qualidade. Open-Meteo, o horizonte da previsão, a unidade inicial, a ausência de autenticação e o idioma da interface foram decididos. Os critérios quantitativos abaixo são propostas iniciais para discussão, não compromissos aprovados.

## Personas Propostas

As personas abaixo são hipóteses baseadas apenas nas funcionalidades do briefing. Devem ser validadas com pesquisa; não representam segmentos confirmados.

### Persona 1 — Planejadora da rotina

- **Objetivo principal:** verificar o clima de hoje e dos próximos dias para se preparar para a rotina.
- **Contexto de uso:** principalmente mobile, em consultas rápidas antes de sair; pode usar desktop para planejar a semana.
- **Métrica de sucesso pessoal:** encontra a cidade correta e identifica as condições relevantes para hoje em até 30 segundos, sem ajuda.

### Persona 2 — Planejador de viagem

- **Objetivo principal:** consultar a previsão de cinco dias para uma cidade de destino antes ou durante uma viagem.
- **Contexto de uso:** principalmente desktop ao planejar; mobile quando já está em deslocamento.
- **Métrica de sucesso pessoal:** consegue consultar a previsão completa do destino e decidir o que levar em até um minuto.

### Persona 3 — Pessoa que prefere outra unidade

- **Objetivo principal:** entender as temperaturas em Celsius ou Fahrenheit conforme a unidade que lhe é familiar.
- **Contexto de uso:** mobile ou desktop, alternando unidades durante a consulta de uma cidade.
- **Métrica de sucesso pessoal:** alterna a unidade e interpreta a temperatura sem confundir o valor ou precisar fazer conversão mental.

## Decisões

1. **Fonte de dados: Open-Meteo, sem API key.** Justificativa: evita a necessidade de gerenciar uma chave de API na aplicação. Resolve a escolha do provedor nas perguntas Q-11 e Q-22; frequência de atualização, cobertura, termos de uso, atribuição e idade máxima dos dados continuam em aberto.
2. **Horizonte da previsão: hoje e os quatro dias seguintes.** Justificativa: define cinco dias-calendário de previsão de forma explícita. Resolve Q-09; o fuso horário usado para determinar “hoje” continua em aberto em Q-10.
3. **Unidade padrão: Celsius.** Justificativa: estabelece um valor inicial previsível para a interface. Resolve a escolha da unidade inicial em Q-13; persistência da preferência do usuário continua em aberto.
4. **Sem autenticação e sem persistência de dados no servidor.** Justificativa: mantém a primeira versão sem contas ou armazenamento de estado pessoal no backend. Resolve a decisão sobre autenticação em Q-03 e a persistência no servidor em Q-19; localização automática e eventual armazenamento local no dispositivo continuam em aberto.
5. **Idioma da interface: pt-BR.** Justificativa: define o idioma da experiência inicial. Resolve o idioma da interface em Q-06 e Q-21; cobertura geográfica, suporte futuro a outros idiomas e formatos de data, hora e números continuam em aberto.

## Requisitos Funcionais

- **RF-01 — Buscar cidades:** permitir que o usuário pesquise uma cidade.
- **RF-02 — Consultar clima atual:** exibir as condições meteorológicas atuais da cidade selecionada.
- **RF-03 — Consultar previsão:** exibir a previsão para cinco dias da cidade selecionada.
- **RF-04 — Alternar unidades:** permitir alternar a temperatura apresentada entre Celsius e Fahrenheit.

## Requisitos Não-Funcionais

- **RNF-01 — Responsividade e suporte móvel:** permitir o uso dos fluxos principais em dispositivos móveis. Proposta para validação: suportar larguras de 320 a 1920 CSS px sem rolagem horizontal. Navegadores e dispositivos suportados precisam ser definidos.
- **RNF-02 — Usabilidade móvel:** manter controles legíveis e utilizáveis por toque em telas pequenas; validar os fluxos de busca e consulta em dispositivos representativos.
- **RNF-03 — Desempenho:** proposta para validação: 95% das consultas exibirem os dados em até 3 segundos sob uma conexão de referência e com o provedor respondendo dentro do limite acordado. O carregamento inicial deve ter meta própria.
- **RNF-04 — Disponibilidade e resiliência:** definir metas mensais separadas para o app e o provedor meteorológico. Proposta para discussão: disponibilidade mensal do app de 99,5%, além de mensagens claras quando a rede ou o provedor estiver indisponível.
- **RNF-05 — Acessibilidade:** proposta para validação: atender WCAG 2.2 nível AA nos fluxos principais, incluindo navegação por teclado, nomes acessíveis para controles e contraste adequado.
- **RNF-06 — Compatibilidade:** definir matriz de navegadores, sistemas operacionais e dispositivos suportados.
- **RNF-07 — Atualização dos dados:** definir a idade máxima aceitável dos dados e informar quando as condições exibidas estiverem desatualizadas.
- **RNF-08 — Segurança e privacidade:** usar HTTPS e definir coleta, uso e retenção de dados; requisitos de localização dependem da decisão sobre localização automática.

## Riscos

Probabilidades e impactos são estimativas preliminares, baseadas apenas no briefing.

| Risco | Probabilidade | Impacto | Mitigação |
| --- | --- | --- | --- |
| Indisponibilidade, lentidão ou limites do provedor meteorológico | Média | Alto: consultas falham ou demoram e reduzem a confiança. | Avaliar limites, termos e disponibilidade do Open-Meteo; definir timeout, tratamento de erros, cache com indicação de desatualização e monitoramento. |
| Dados imprecisos ou desatualizados | Média | Alto: usuários podem tomar decisões com informações incorretas. | Exibir fonte e horário da última atualização; definir idade máxima dos dados e comportamento quando excedida. |
| Cidades homônimas ou cobertura de busca insuficiente | Média | Médio/alto: usuário pode consultar o local errado ou não encontrar sua cidade. | Exibir região e país nos resultados; validar critérios de busca e cobertura geográfica. |
| Interpretação ambígua dos cinco dias ou do fuso horário | Média | Médio: datas e períodos podem não corresponder à expectativa. | Definir se o período inclui hoje e usar um critério de fuso consistente; testar limites de data. |
| Conversão ou apresentação incorreta de unidades | Baixa | Médio: valores inconsistentes prejudicam a confiança. | Definir unidades e arredondamento; cobrir conversões e rótulos com testes. |
| Experiência móvel inadequada ou inacessível | Média | Alto: usuários podem não conseguir completar tarefas essenciais. | Definir a matriz de suporte; testar em dispositivos reais, por teclado e com leitor de tela. |
| Necessidades do público e sucesso do produto não definidos | Alta | Alto: o produto pode entregar funcionalidades sem resolver a necessidade real. | Validar público, tarefas prioritárias e métricas de sucesso com stakeholders e usuários. |
| Cobertura geográfica e formatos não definidos | Média | Alto: regiões prioritárias podem ter resultados incompletos ou difíceis de entender. | Priorizar regiões, confirmar a cobertura do Open-Meteo e definir formatos de data, hora e números compatíveis com pt-BR. |
| Usuários interpretarem previsões como garantias | Média | Alto: divergências entre previsão e condições reais podem causar perda de confiança. | Comunicar fonte, horário de atualização e limitações; não apresentar previsão como certeza. |
| Expansão de escopo para recursos não acordados | Média | Médio/alto: atrasos e perda de foco no fluxo principal. | Definir o escopo da primeira versão e registrar explicitamente itens fora de escopo. |

## Perguntas em Aberto

1. **Q-01 — Quem são os usuários-alvo e em quais situações consultarão o app?** Impacto: sem isso, prioridades, linguagem e fluxos podem não corresponder às necessidades reais.
2. **Q-02 — Como será medido o sucesso do produto?** Impacto: não será possível verificar se o app resolve o problema ou decidir prioridades com base em resultados.
3. **Q-03 — Além de não haver autenticação, quais funções fazem parte da primeira versão? Localização automática, favoritos e alertas estão incluídos?** Impacto: escopo indefinido pode causar atrasos e mudanças durante a implementação.
4. **Q-04 — A busca aceita nomes de cidades apenas ou também estados, regiões, países e códigos postais?** Impacto: busca e cobertura podem ser insuficientes para os usuários.
5. **Q-05 — Como diferenciar cidades com o mesmo nome?** Impacto: o usuário pode receber dados do local errado.
6. **Q-06 — Quais países e territórios terão cobertura? Há necessidade de oferecer outros idiomas além da interface pt-BR?** Impacto: a busca pode não cobrir localidades importantes e usuários de outros idiomas podem não ser atendidos.
7. **Q-07 — Quais dados compõem o clima atual?** Impacto: “clima atual” pode gerar entregas diferentes e dificultar critérios de aceite.
8. **Q-08 — Quais informações devem aparecer para cada dia da previsão?** Impacto: a previsão pode cobrir cinco dias sem responder às necessidades do usuário.
9. **Q-10 — Qual fuso horário determina as datas exibidas para hoje e os quatro dias seguintes?** Impacto: previsões podem aparecer associadas a dias incorretos, especialmente em consultas internacionais.
10. **Q-11 — Qual frequência de atualização e idade máxima são aceitáveis para os dados do Open-Meteo?** Impacto: sem decisão, não se pode avaliar atualidade, precisão percebida nem risco de dados obsoletos.
11. **Q-12 — Celsius/Fahrenheit se aplica somente à temperatura? Quais unidades serão usadas para outras medidas?** Impacto: a interface pode misturar convenções e confundir usuários.
12. **Q-13 — A preferência por unidade deve persistir entre sessões ou dispositivos?** Impacto: sem persistência definida, o usuário pode precisar escolher a unidade novamente.
13. **Q-14 — O que deve ocorrer com buscas vazias, inválidas ou sem resultados?** Impacto: usuários podem não saber como corrigir a busca ou interpretar o estado do app.
14. **Q-15 — Quais dispositivos, larguras de tela, navegadores e sistemas operacionais são suportados? Há paridade funcional móvel?** Impacto: “uso móvel” não será testável e fluxos podem falhar em dispositivos reais.
15. **Q-16 — Quais metas de desempenho são aceitáveis e sob quais condições de rede?** Impacto: não haverá critério objetivo para identificar lentidão ou validar a experiência.
16. **Q-17 — Qual disponibilidade é esperada e como tratar falhas da rede ou do provedor?** Impacto: interrupções podem deixar o usuário sem orientação ou expor dados antigos como atuais.
17. **Q-18 — Qual padrão de acessibilidade deve ser atendido?** Impacto: pessoas que usam teclado ou tecnologias assistivas podem não conseguir usar os fluxos principais.
18. **Q-19 — O app usará apenas a cidade digitada ou também a localização do dispositivo? Haverá armazenamento local no dispositivo?** Impacto: a decisão afeta permissões, privacidade, confiança e expectativas de persistência.
19. **Q-20 — Há requisitos de segurança, limites de uso ou proteção contra consultas automatizadas?** Impacto: abuso pode degradar o serviço ou exceder limites do provedor.
20. **Q-21 — Quais formatos de data, hora e números devem ser usados na interface pt-BR?** Impacto: valores podem ser difíceis de interpretar ou parecer incorretos.
21. **Q-22 — Quais requisitos de atribuição da fonte e avisos sobre limitações da previsão devem ser apresentados?** Impacto: omissões podem reduzir a confiança ou descumprir termos de uso.

## Suposições

- O usuário informa uma cidade para iniciar a consulta; localização automática não está confirmada.
- O clima atual e a previsão são consultados para uma cidade selecionada.
- A alternância entre Celsius e Fahrenheit altera a apresentação da temperatura; persistência da preferência ainda depende de decisão.
- O serviço usa Open-Meteo sem API key; frequência de atualização, atribuição e idade máxima dos dados ainda precisam ser definidas.
- A previsão compreende hoje e os quatro dias seguintes; o fuso horário de referência ainda precisa ser definido.
- Celsius é a unidade inicial; persistência da preferência ainda precisa ser decidida.
- A interface será em pt-BR; cobertura geográfica e formatos localizados ainda precisam ser definidos.
- Não haverá autenticação nem persistência de dados no servidor; armazenamento local no dispositivo não foi decidido.
- Favoritos, alertas e notificações não foram solicitados e não são considerados escopo confirmado.
- Os limites quantitativos sugeridos nos requisitos não-funcionais são candidatos para discussão, não compromissos aprovados.
- Este discovery inicial deve ser validado com stakeholders antes de servir como especificação final ou critério de aceite.