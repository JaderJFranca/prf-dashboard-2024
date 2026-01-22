# PRF Dashboard 2024 - TODO

## Fase 1: Análise de Dados
- [x] Analisar estrutura do arquivo datatran2024.csv
- [x] Validar quantidade de registros (73.156)
- [x] Identificar colunas relevantes para análises

## Fase 2: Preparação de Dados
- [x] Copiar arquivo CSV para projeto
- [x] Criar script de processamento de dados
- [x] Implementar API tRPC para servir dados agregados
- [x] Criar endpoints para: causas, dias da semana, vítimas, fase/clima, tipo pista
- [x] Implementar filtro por UF na API

## Fase 3: Desenvolvimento do Dashboard
- [x] Configurar design system (cores, tipografia, espaçamento)
- [x] Criar layout com abas (Visão Geral, Causas e Severidade, Fatores Ambientais)
- [x] Implementar filtro global por UF
- [x] Aba 1 - Visão Geral:
  - [x] KPIs de vítimas (mortos, feridos graves, feridos leves, ilesos)
  - [x] Gráfico de acidentes por dia da semana
- [x] Aba 2 - Causas e Severidade:
  - [x] Gráfico de barras Top 10 causas com percentual
  - [x] Análise de classificação de acidentes
- [x] Aba 3 - Fatores Ambientais:
  - [x] Gráfico de fase do dia vs condição meteorológica
  - [x] Gráfico de acidentes por tipo de pista
- [x] Tornar dashboard público (sem autenticação)

## Fase 4: Publicação
- [x] Validar carregamento de dados
- [x] Testar filtros e interatividade
- [x] Publicar dashboard
- [x] Gerar link público

## Fase 5: Entrega
- [ ] Apresentar dashboard ao usuário
- [ ] Fornecer link de acesso público

## Fase 5: Ajustes de Profissionalismo e Clareza
- [x] Melhorar título do dashboard para algo mais profissional
- [x] Melhorar visualização das descrições das causas no gráfico Top 10
- [x] Filtrar e tratar dado "Ignorado" na condição meteorológica

## Fase 6: Documentação
- [x] Criar README.md profissional para GitHub
- [x] Criar arquivo LICENSE (MIT) oficial
