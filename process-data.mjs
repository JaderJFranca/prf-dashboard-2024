import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { parse } from 'csv-parse/sync';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Ler arquivo CSV
const csvPath = path.join(__dirname, 'datatran2024.csv');
const csvContent = fs.readFileSync(csvPath, 'latin1');

// Parse CSV
const records = parse(csvContent, {
  delimiter: ';',
  columns: true,
  skip_empty_lines: true,
});

console.log(`Total de registros: ${records.length}`);

// Processar dados
const data = {
  total_acidentes: records.length,
  total_mortos: 0,
  total_feridos_graves: 0,
  total_feridos_leves: 0,
  total_ilesos: 0,
  ufs: {},
  causas_por_uf: {},
  dias_semana_por_uf: {},
  fase_dia_por_uf: {},
  condicao_metereologica_por_uf: {},
  tipo_pista_por_uf: {},
  classificacao_por_uf: {},
};

// Ordem correta dos dias da semana
const diasOrdenados = ['segunda-feira', 'terça-feira', 'quarta-feira', 'quinta-feira', 'sexta-feira', 'sábado', 'domingo'];

// Processar cada registro
records.forEach(record => {
  const uf = record.uf?.trim() || 'DESCONHECIDO';
  const mortos = parseInt(record.mortos) || 0;
  const feridos_graves = parseInt(record.feridos_graves) || 0;
  const feridos_leves = parseInt(record.feridos_leves) || 0;
  const ilesos = parseInt(record.ilesos) || 0;
  const causa = record.causa_acidente?.trim() || 'Desconhecida';
  const dia = record.dia_semana?.trim() || 'Desconhecido';
  const fase = record.fase_dia?.trim() || 'Desconhecida';
  const condicao = record.condicao_metereologica?.trim() || 'Desconhecida';
  const pista = record.tipo_pista?.trim() || 'Desconhecida';
  const classificacao = record.classificacao_acidente?.trim() || 'Desconhecida';

  // Totais globais
  data.total_mortos += mortos;
  data.total_feridos_graves += feridos_graves;
  data.total_feridos_leves += feridos_leves;
  data.total_ilesos += ilesos;

  // Inicializar UF se não existe
  if (!data.ufs[uf]) {
    data.ufs[uf] = {
      total_acidentes: 0,
      total_mortos: 0,
      total_feridos_graves: 0,
      total_feridos_leves: 0,
      total_ilesos: 0,
    };
    data.causas_por_uf[uf] = {};
    data.dias_semana_por_uf[uf] = {};
    data.fase_dia_por_uf[uf] = {};
    data.condicao_metereologica_por_uf[uf] = {};
    data.tipo_pista_por_uf[uf] = {};
    data.classificacao_por_uf[uf] = {};
  }

  // Atualizar totais por UF
  data.ufs[uf].total_acidentes += 1;
  data.ufs[uf].total_mortos += mortos;
  data.ufs[uf].total_feridos_graves += feridos_graves;
  data.ufs[uf].total_feridos_leves += feridos_leves;
  data.ufs[uf].total_ilesos += ilesos;

  // Causas
  data.causas_por_uf[uf][causa] = (data.causas_por_uf[uf][causa] || 0) + 1;

  // Dias da semana
  data.dias_semana_por_uf[uf][dia] = (data.dias_semana_por_uf[uf][dia] || 0) + 1;

  // Fase do dia
  data.fase_dia_por_uf[uf][fase] = (data.fase_dia_por_uf[uf][fase] || 0) + 1;

  // Condição meteorológica
  data.condicao_metereologica_por_uf[uf][condicao] = (data.condicao_metereologica_por_uf[uf][condicao] || 0) + 1;

  // Tipo de pista
  data.tipo_pista_por_uf[uf][pista] = (data.tipo_pista_por_uf[uf][pista] || 0) + 1;

  // Classificação
  data.classificacao_por_uf[uf][classificacao] = (data.classificacao_por_uf[uf][classificacao] || 0) + 1;
});

// Converter para arrays e ordenar
const processedData = {
  ...data,
  causas_por_uf: Object.fromEntries(
    Object.entries(data.causas_por_uf).map(([uf, causas]) => [
      uf,
      Object.entries(causas)
        .map(([causa, count]) => ({ causa, count }))
        .sort((a, b) => b.count - a.count),
    ])
  ),
  dias_semana_por_uf: Object.fromEntries(
    Object.entries(data.dias_semana_por_uf).map(([uf, dias]) => [
      uf,
      diasOrdenados.map(dia => ({ dia, count: dias[dia] || 0 })),
    ])
  ),
  fase_dia_por_uf: Object.fromEntries(
    Object.entries(data.fase_dia_por_uf).map(([uf, fases]) => [
      uf,
      Object.entries(fases)
        .map(([fase, count]) => ({ fase, count }))
        .sort((a, b) => b.count - a.count),
    ])
  ),
  condicao_metereologica_por_uf: Object.fromEntries(
    Object.entries(data.condicao_metereologica_por_uf).map(([uf, condicoes]) => [
      uf,
      Object.entries(condicoes)
        .map(([condicao, count]) => ({ condicao, count }))
        .sort((a, b) => b.count - a.count),
    ])
  ),
  tipo_pista_por_uf: Object.fromEntries(
    Object.entries(data.tipo_pista_por_uf).map(([uf, pistas]) => [
      uf,
      Object.entries(pistas)
        .map(([pista, count]) => ({ pista, count }))
        .sort((a, b) => b.count - a.count),
    ])
  ),
  classificacao_por_uf: Object.fromEntries(
    Object.entries(data.classificacao_por_uf).map(([uf, classificacoes]) => [
      uf,
      Object.entries(classificacoes)
        .map(([classificacao, count]) => ({ classificacao, count }))
        .sort((a, b) => b.count - a.count),
    ])
  ),
};

// Salvar JSON
const outputPath = path.join(__dirname, 'public', 'accidents-data.json');
fs.mkdirSync(path.dirname(outputPath), { recursive: true });
fs.writeFileSync(outputPath, JSON.stringify(processedData, null, 2));

console.log(`Dados processados e salvos em: ${outputPath}`);
console.log(`Total de UFs: ${Object.keys(processedData.ufs).length}`);
