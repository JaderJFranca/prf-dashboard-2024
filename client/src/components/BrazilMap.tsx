import { useEffect, useState, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

interface StateAccidentData {
  uf: string;
  count: number;
  deaths?: number;
  severeInjuries?: number;
}

interface BrazilMapProps {
  data: Array<{ uf: string; totalAccidents: number; totalDeaths?: number; totalSevereInjuries?: number }>;
  onStateSelect?: (uf: string) => void;
  selectedUf?: string;
}

// Mapeamento de siglas de estados para nomes completos
const STATE_NAMES: Record<string, string> = {
  'AC': 'Acre',
  'AL': 'Alagoas',
  'AP': 'Amapá',
  'AM': 'Amazonas',
  'BA': 'Bahia',
  'CE': 'Ceará',
  'DF': 'Distrito Federal',
  'ES': 'Espírito Santo',
  'GO': 'Goiás',
  'MA': 'Maranhão',
  'MT': 'Mato Grosso',
  'MS': 'Mato Grosso do Sul',
  'MG': 'Minas Gerais',
  'PA': 'Pará',
  'PB': 'Paraíba',
  'PR': 'Paraná',
  'PE': 'Pernambuco',
  'PI': 'Piauí',
  'RJ': 'Rio de Janeiro',
  'RN': 'Rio Grande do Norte',
  'RS': 'Rio Grande do Sul',
  'RO': 'Rondônia',
  'RR': 'Roraima',
  'SC': 'Santa Catarina',
  'SP': 'São Paulo',
  'SE': 'Sergipe',
  'TO': 'Tocantins',
};

// Paleta de cores azul sequencial (executiva)
const BLUE_PALETTE = {
  0: '#E8F1F8',    // Azul muito claro (Baixa incidência)
  1: '#C5DCF0',    // Azul claro
  2: '#A2CCEB',    // Azul médio-claro
  3: '#7FBCE5',    // Azul médio
  4: '#5CADDE',    // Azul médio-escuro
  5: '#3A9DD8',    // Azul escuro
  6: '#1F7FA8',    // Azul muito escuro (Alta incidência)
};

export default function BrazilMap({ data, onStateSelect, selectedUf }: BrazilMapProps) {
  const [geoData, setGeoData] = useState<any>(null);
  const [hoveredState, setHoveredState] = useState<string | null>(null);
  const [tooltip, setTooltip] = useState<{ x: number; y: number; state: string; data: any } | null>(null);

  // Carregar GeoJSON do Brasil
  useEffect(() => {
    const loadGeoData = async () => {
      try {
        const response = await fetch('/br-states.geojson');
        const json = await response.json();
        setGeoData(json);
      } catch (error) {
        console.error('Erro ao carregar GeoJSON:', error);
      }
    };

    loadGeoData();
  }, []);

  // Calcular estatísticas para escala
  const { minAccidents, maxAccidents, totalAccidents, scaleRanges } = useMemo(() => {
    if (data.length === 0) return { minAccidents: 0, maxAccidents: 0, totalAccidents: 0, scaleRanges: { low: 0, medium: 0, high: 0 } };
    
    const counts = data.map(d => d.totalAccidents);
    const min = Math.min(...counts);
    const max = Math.max(...counts);
    const total = counts.reduce((a, b) => a + b, 0);
    
    // Definir ranges para escala quantitativa
    const range = max - min;
    const low = min + range * 0.33;
    const medium = min + range * 0.66;
    
    return {
      minAccidents: min,
      maxAccidents: max,
      totalAccidents: total,
      scaleRanges: {
        low: Math.round(low),
        medium: Math.round(medium),
        high: max,
      },
    };
  }, [data]);

  // Função para obter cor baseada na intensidade (paleta azul)
  const getColor = (count: number): string => {
    if (maxAccidents === minAccidents) return BLUE_PALETTE[3];
    
    const intensity = (count - minAccidents) / (maxAccidents - minAccidents);
    
    if (intensity < 0.15) return BLUE_PALETTE[0];
    if (intensity < 0.30) return BLUE_PALETTE[1];
    if (intensity < 0.45) return BLUE_PALETTE[2];
    if (intensity < 0.60) return BLUE_PALETTE[3];
    if (intensity < 0.75) return BLUE_PALETTE[4];
    if (intensity < 0.90) return BLUE_PALETTE[5];
    return BLUE_PALETTE[6];
  };

  // Função para obter cor de texto (sempre legível)
  const getTextColor = (count: number): string => {
    const color = getColor(count);
    // Se a cor for muito clara, usar texto escuro
    if ([BLUE_PALETTE[0], BLUE_PALETTE[1], BLUE_PALETTE[2]].includes(color)) {
      return '#1F3A5F';
    }
    return '#FFFFFF';
  };

  // Obter dados do estado
  const getStateData = (uf: string) => {
    return data.find(d => d.uf === uf);
  };

  // Renderizar SVG do mapa
  const renderMap = () => {
    if (!geoData) {
      return (
        <div className="flex items-center justify-center h-96 bg-white rounded">
          <p className="text-slate-600">Carregando mapa...</p>
        </div>
      );
    }

    const features = geoData.features || [];
    
    // Encontrar bounds do mapa
    let minLng = 180, maxLng = -180, minLat = 90, maxLat = -90;
    
    features.forEach((feature: any) => {
      if (feature.geometry.type === 'MultiPolygon') {
        feature.geometry.coordinates.forEach((polygon: any) => {
          polygon.forEach((ring: any) => {
            ring.forEach(([lng, lat]: [number, number]) => {
              minLng = Math.min(minLng, lng);
              maxLng = Math.max(maxLng, lng);
              minLat = Math.min(minLat, lat);
              maxLat = Math.max(maxLat, lat);
            });
          });
        });
      }
    });

    const width = 1200;
    const height = 700;
    const padding = 40;

    // Função para converter coordenadas geográficas para SVG
    const projectPoint = (lng: number, lat: number) => {
      const x = ((lng - minLng) / (maxLng - minLng)) * (width - 2 * padding) + padding;
      const y = ((maxLat - lat) / (maxLat - minLat)) * (height - 2 * padding) + padding;
      return [x, y];
    };

    return (
      <svg 
        viewBox={`0 0 ${width} ${height}`} 
        className="w-full h-auto bg-white rounded-lg"
        onMouseMove={(e) => {
          const rect = e.currentTarget.getBoundingClientRect();
          const x = e.clientX - rect.left;
          const y = e.clientY - rect.top;
        }}
      >
        {/* Renderizar estados */}
        {features.map((feature: any, idx: number) => {
          const stateName = feature.properties?.name || '';
          const uf = Object.entries(STATE_NAMES).find(
            ([_, name]) => name.toLowerCase() === stateName.toLowerCase()
          )?.[0];

          if (!uf) return null;

          const stateData = getStateData(uf);
          const accidentCount = stateData?.totalAccidents || 0;
          const color = getColor(accidentCount);
          const textColor = getTextColor(accidentCount);
          const isHovered = hoveredState === uf;
          const isSelected = selectedUf === uf;

          return (
            <g key={idx}>
              {feature.geometry.type === 'MultiPolygon' &&
                feature.geometry.coordinates.map((polygon: any, pIdx: number) => {
                  const pathData = polygon
                    .map((ring: any, rIdx: number) => {
                      const points = ring.map((coord: [number, number]) => {
                        const [x, y] = projectPoint(coord[0], coord[1]);
                        return `${x},${y}`;
                      });
                      return (rIdx === 0 ? 'M' : 'm') + points.join('L') + 'Z';
                    })
                    .join('');

                  return (
                    <path
                      key={`${idx}-${pIdx}`}
                      d={pathData}
                      fill={color}
                      stroke={isSelected ? '#1F3A5F' : '#FFFFFF'}
                      strokeWidth={isSelected ? 3 : 1.5}
                      opacity={1}
                      className="cursor-pointer transition-all hover:stroke-slate-400"
                      onMouseEnter={() => {
                        setHoveredState(uf);
                        const bbox = (event?.currentTarget as any)?.getBBox?.();
                        if (bbox) {
                          setTooltip({
                            x: bbox.x + bbox.width / 2,
                            y: bbox.y - 10,
                            state: uf,
                            data: stateData,
                          });
                        }
                      }}
                      onMouseLeave={() => {
                        setHoveredState(null);
                        setTooltip(null);
                      }}
                      onClick={() => onStateSelect?.(uf)}
                    />
                  );
                })}

              {/* Rótulo do estado (sigla) */}
              {feature.geometry.type === 'MultiPolygon' && (
                <text
                  x={projectPoint(
                    feature.geometry.coordinates[0][0].reduce((sum: number, coord: [number, number]) => sum + coord[0], 0) /
                      feature.geometry.coordinates[0][0].length,
                    feature.geometry.coordinates[0][0].reduce((sum: number, coord: [number, number]) => sum + coord[1], 0) /
                      feature.geometry.coordinates[0][0].length
                  )[0]}
                  y={projectPoint(
                    feature.geometry.coordinates[0][0].reduce((sum: number, coord: [number, number]) => sum + coord[0], 0) /
                      feature.geometry.coordinates[0][0].length,
                    feature.geometry.coordinates[0][0].reduce((sum: number, coord: [number, number]) => sum + coord[1], 0) /
                      feature.geometry.coordinates[0][0].length
                  )[1]}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  fontSize={isHovered ? '14' : '11'}
                  fontWeight="bold"
                  fill={textColor}
                  className="pointer-events-none select-none transition-all"
                  style={{
                    textShadow: textColor === '#FFFFFF' ? '0 1px 2px rgba(0,0,0,0.3)' : 'none',
                  }}
                >
                  {uf}
                </text>
              )}
            </g>
          );
        })}
      </svg>
    );
  };

  // Calcular percentual
  const getPercentage = (count: number) => {
    return totalAccidents > 0 ? ((count / totalAccidents) * 100).toFixed(1) : '0.0';
  };

  // Classificar intensidade
  const getIntensityLabel = (count: number): string => {
    if (count <= scaleRanges.low) return 'Baixa';
    if (count <= scaleRanges.medium) return 'Média';
    return 'Alta';
  };

  return (
    <Card className="border-slate-200">
      <CardHeader className="pb-3">
        <CardTitle className="text-xl">Distribuição de Acidentes nas Rodovias Federais por Estado – 2024</CardTitle>
        <CardDescription>Estados com maior intensidade de ocorrências ao longo do ano</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="w-full space-y-4">
          {/* Legenda com escala quantitativa */}
          <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
            <p className="text-xs font-semibold text-slate-900 mb-3">Escala de Incidência</p>
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded" style={{ backgroundColor: BLUE_PALETTE[0], border: '1px solid #cbd5e1' }}></div>
                <div className="text-xs">
                  <p className="font-semibold text-slate-900">Baixa</p>
                  <p className="text-slate-600">até {scaleRanges.low.toLocaleString()} acidentes</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded" style={{ backgroundColor: BLUE_PALETTE[3] }}></div>
                <div className="text-xs">
                  <p className="font-semibold text-slate-900">Média</p>
                  <p className="text-slate-600">{scaleRanges.low.toLocaleString()} a {scaleRanges.medium.toLocaleString()}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded" style={{ backgroundColor: BLUE_PALETTE[6] }}></div>
                <div className="text-xs">
                  <p className="font-semibold text-slate-900">Alta</p>
                  <p className="text-slate-600">acima de {scaleRanges.medium.toLocaleString()}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Mapa */}
          <div className="w-full bg-white rounded-lg border border-slate-200 overflow-hidden">
            {renderMap()}
          </div>

          {/* Tabela de dados (Top 10) */}
          <div className="bg-slate-50 rounded-lg border border-slate-200 p-4">
            <p className="text-xs font-semibold text-slate-900 mb-3">Ranking de Incidência</p>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-2">
              {data
                .sort((a, b) => b.totalAccidents - a.totalAccidents)
                .slice(0, 10)
                .map((state, idx) => (
                  <div
                    key={state.uf}
                    className="p-2 rounded border border-slate-200 transition-all cursor-pointer hover:bg-white hover:shadow-sm"
                    style={{ backgroundColor: getColor(state.totalAccidents) + '30' }}
                    onClick={() => onStateSelect?.(state.uf)}
                    onMouseEnter={() => setHoveredState(state.uf)}
                    onMouseLeave={() => setHoveredState(null)}
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="font-bold text-slate-900">{idx + 1}º {state.uf}</p>
                        <p className="text-xs text-slate-600">{STATE_NAMES[state.uf]}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-slate-900">{state.totalAccidents.toLocaleString()}</p>
                        <p className="text-xs text-slate-600">{getPercentage(state.totalAccidents)}%</p>
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          </div>

          {/* Informações adicionais */}
          <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-xs text-blue-900">
              <strong>Como usar:</strong> Clique em um estado no mapa ou na tabela para filtrar todos os gráficos. 
              A intensidade de cor indica o volume de acidentes registrados. Use esta visualização para identificar rapidamente 
              regiões críticas que requerem ações preventivas e operacionais da PRF.
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
