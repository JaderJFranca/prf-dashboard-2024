# 📊 Análise Executiva de Acidentes - PRF 2024

[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![Status](https://img.shields.io/badge/status-active-success.svg)]()
[![Version](https://img.shields.io/badge/version-1.0.0-blue.svg)]()
[![Data](https://img.shields.io/badge/dataset-73.156%20registros-brightgreen.svg)]()

> **Dashboard interativo e executivo para análise de acidentes nas rodovias federais brasileiras em 2024**

Um sistema de inteligência operacional que processa e visualiza dados de 73.156 acidentes registrados pela Polícia Rodoviária Federal, fornecendo insights acionáveis para tomada de decisão estratégica.

---

## 🎯 Visão Geral

Este dashboard oferece uma análise profunda e executiva dos acidentes de trânsito nas rodovias federais brasileiras durante o ano de 2024. Através de visualizações interativas e filtros por estado, permite identificar padrões, causas prioritárias e fatores ambientais que influenciam a segurança viária.

### 📈 Dados Processados

| Métrica | Valor |
|---------|-------|
| **Total de Acidentes** | 73.156 |
| **Vítimas Fatais** | 6.160 |
| **Feridos Graves** | 20.344 |
| **Feridos Leves** | 64.182 |
| **Pessoas Ilesas** | 76.675 |
| **Estados Cobertos** | 27 |
| **Período** | 2024 |

---

## ✨ Funcionalidades Principais

### 🔍 Análises Disponíveis

#### 1️⃣ **Visão Geral**
- **KPIs de Vítimas**: Visualização clara de mortos, feridos graves, feridos leves e ilesos
- **Acidentes por Dia da Semana**: Identificação de padrões entre dias úteis e finais de semana
- **Total de Acidentes**: Contagem agregada por estado selecionado

#### 2️⃣ **Causas e Severidade**
- **Top 10 Causas de Acidentes**: Gráfico de barras horizontal com percentual de participação
- **Descrições Completas**: Tooltip interativo mostrando descrição completa de cada causa
- **Classificação de Acidentes**: Distribuição por gravidade em gráfico de pizza

#### 3️⃣ **Fatores Ambientais**
- **Acidentes por Fase do Dia**: Análise de períodos (Plena Noite, Amanhecer, Pleno dia, Anoitecer)
- **Condição Meteorológica**: Influência do clima nos acidentes (dados validados)
- **Tipo de Pista**: Comparação entre pistas simples, duplas e múltiplas

### 🌍 Filtro Global por Estado
- Seletor interativo de 27 estados brasileiros
- Afeta todos os gráficos e KPIs simultaneamente
- Análise descentralizada por região

### 🎨 Interface Profissional
- Design clean e executivo
- Paleta de cores profissional com contraste otimizado
- Responsivo para desktop, tablet e mobile
- Carregamento rápido de dados

---

## 🚀 Como Usar

### Acesso Online

O dashboard está disponível para acesso público sem necessidade de autenticação:

```
https://https://prfdash24-m6p7qfbr.manus.space
```

### Instalação Local

#### Pré-requisitos
- Node.js 18+ 
- pnpm 10+
- Git

#### Passos

1. **Clone o repositório**
```bash
git clone https://github.com/seu-usuario/prf-dashboard-2024.git
cd prf-dashboard-2024
```

2. **Instale as dependências**
```bash
pnpm install
```

3. **Configure as variáveis de ambiente**
```bash
cp .env.example .env.local
# Edite .env.local com suas configurações
```

4. **Inicie o servidor de desenvolvimento**
```bash
pnpm dev
```

5. **Acesse no navegador**
```
http://localhost:3000
```

### Build para Produção

```bash
pnpm build
pnpm start
```

---

## 📊 Estrutura de Dados

### Arquivo de Dados

O dashboard processa dados de um arquivo JSON estruturado contendo:

```json
{
  "total_acidentes": 73156,
  "total_mortos": 6160,
  "total_feridos_graves": 20344,
  "total_feridos_leves": 64182,
  "total_ilesos": 76675,
  "ufs": {
    "SP": { "total_acidentes": 12345, ... },
    "RJ": { "total_acidentes": 8901, ... }
  },
  "causas_por_uf": { ... },
  "dias_semana_por_uf": { ... },
  "fase_dia_por_uf": { ... },
  "condicao_metereologica_por_uf": { ... },
  "tipo_pista_por_uf": { ... },
  "classificacao_por_uf": { ... }
}
```

### Fonte de Dados

Dados obtidos da **Polícia Rodoviária Federal (PRF)** - Portal de Dados Abertos:
- 📌 [Dados Abertos PRF](https://www.gov.br/prf/pt-br/acesso-a-informacao/dados-abertos/dados-abertos-da-prf)
- 📅 Período: 2024
- 📝 Total de registros: 73.156 acidentes

---

## 🛠️ Stack Tecnológico

### Frontend
- **React 19** - Biblioteca UI
- **TypeScript** - Tipagem estática
- **Tailwind CSS 4** - Estilização
- **Recharts** - Visualização de dados
- **Shadcn/ui** - Componentes reutilizáveis

### Backend
- **Express 4** - Servidor web
- **tRPC 11** - API type-safe
- **MySQL/TiDB** - Banco de dados
- **Drizzle ORM** - Gerenciamento de dados

### DevOps
- **Vite** - Build tool
- **Vitest** - Testes unitários
- **Prettier** - Formatação de código
- **TypeScript** - Verificação de tipos

---

## 📁 Estrutura do Projeto

```
prf-dashboard-2024/
├── client/                          # Frontend React
│   ├── public/
│   │   └── accidents-data.json     # Dados de acidentes
│   └── src/
│       ├── pages/
│       │   └── Dashboard.tsx       # Página principal
│       ├── components/             # Componentes reutilizáveis
│       ├── lib/
│       │   └── trpc.ts            # Cliente tRPC
│       └── App.tsx                # Roteamento principal
├── server/                         # Backend Express
│   ├── routers.ts                 # Procedimentos tRPC
│   ├── db.ts                      # Queries do banco
│   └── _core/                     # Infraestrutura
├── drizzle/
│   └── schema.ts                  # Schema do banco de dados
├── shared/                        # Código compartilhado
├── vite.config.ts                 # Configuração Vite
├── package.json                   # Dependências
└── README.md                      # Este arquivo
```

---

## 🔍 Insights Esperados

### Análises Possíveis

✅ **Identificar causas prioritárias** para campanhas educativas e fiscalização

✅ **Comparar dias úteis vs finais de semana** para reforço de policiamento

✅ **Diferenciar alta frequência × alta gravidade** entre estados

✅ **Identificar períodos críticos** (ex: noite + chuva) para ações preventivas

✅ **Avaliar influência de infraestrutura** na segurança viária

✅ **Detectar hotspots regionais** com maior concentração de acidentes

---

## 🧪 Testes

### Executar Testes Unitários

```bash
pnpm test
```

### Cobertura de Testes

```bash
pnpm test -- --coverage
```

---

## 📝 Tratamento de Dados

### Validações Aplicadas

- ✅ Remoção de registros com condição meteorológica "Ignorado"
- ✅ Filtro de dados incompletos ou inválidos
- ✅ Agregação por estado e categoria
- ✅ Cálculo de percentuais e métricas

### Qualidade dos Dados

- **Fonte Confiável**: Dados oficiais da PRF
- **Período Completo**: Cobertura de todo o ano 2024
- **Validação**: Verificação de integridade e consistência
- **Atualização**: Dados processados e validados

---

## 📄 Licença

Este projeto está licenciado sob a licença MIT. Veja o arquivo [LICENSE](LICENSE) para mais detalhes.

---

## 📚 Referências

- [Portal de Dados Abertos - PRF](https://www.gov.br/prf/pt-br/acesso-a-informacao/dados-abertos/dados-abertos-da-prf)
- [Documentação React](https://react.dev)
- [Documentação Recharts](https://recharts.org)
- [Documentação tRPC](https://trpc.io)

---

**[⬆ Voltar ao topo](#-análise-executiva-de-acidentes---prf-2024)**

</div>
