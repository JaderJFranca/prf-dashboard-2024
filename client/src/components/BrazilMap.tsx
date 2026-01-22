import { useEffect, useState, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

interface StateAccidentData {
  uf: string;
  count: number;
}

interface BrazilMapProps {
  data: Array<{ uf: string; totalAccidents: number }>;
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

export default function BrazilMap({ data }: BrazilMapProps) {
  const [geoData, setGeoData] = useState<any>(null);
  const [hoveredState, setHoveredState] = useState<string | null>(null);

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

  // Preparar dados de acidentes por estado
  const accidentsByState = useMemo(() => {
    const map = new Map<string, number>();
    data.forEach(item => {
      map.set(item.uf, item.totalAccidents);
    });
    return map;
  }, [data]);

  // Calcular min e max para escala de cores
  const { minAccidents, maxAccidents } = useMemo(() => {
    if (data.length === 0) return { minAccidents: 0, maxAccidents: 0 };
    const counts = data.map(d => d.totalAccidents);
    return {
      minAccidents: Math.min(...counts),
      maxAccidents: Math.max(...counts),
    };
  }, [data]);

  // Função para obter cor monocromática baseada na intensidade
  const getColor = (count: number): string => {
    if (maxAccidents === minAccidents) return '#808080';
    const intensity = (count - minAccidents) / (maxAccidents - minAccidents);
    // Escala de cinza: 0 = branco (#f5f5f5), 1 = preto (#0f172a)
    const gray = Math.round(245 - intensity * 240);
    return `rgb(${gray}, ${gray}, ${gray})`;
  };

  // Função para obter cor de texto
  const getTextColor = (count: number): string => {
    if (maxAccidents === minAccidents) return '#000000';
    const intensity = (count - minAccidents) / (maxAccidents - minAccidents);
    return intensity > 0.5 ? '#ffffff' : '#000000';
  };

  // Renderizar SVG do mapa
  const renderMap = () => {
    if (!geoData) {
      return (
        <div className="flex items-center justify-center h-96 bg-slate-100 rounded">
          <p className="text-slate-600">Carregando mapa...</p>
        </div>
      );
    }

    // Extrair features e criar elementos SVG
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

    const width = 1000;
    const height = 600;
    const padding = 40;

    // Função para converter coordenadas geográficas para SVG
    const projectPoint = (lng: number, lat: number) => {
      const x = ((lng - minLng) / (maxLng - minLng)) * (width - 2 * padding) + padding;
      const y = ((maxLat - lat) / (maxLat - minLat)) * (height - 2 * padding) + padding;
      return [x, y];
    };

    return (
      <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-auto bg-gradient-to-b from-blue-50 to-slate-50 rounded-lg">
        {/* Fundo */}
        <defs>
          <filter id="shadow">
            <feDropShadow dx="0" dy="2" stdDeviation="3" floodOpacity="0.2" />
          </filter>
        </defs>

        {/* Renderizar estados */}
        {features.map((feature: any, idx: number) => {
          const stateName = feature.properties?.name || '';
          // Extrair sigla do nome do estado
          const uf = Object.entries(STATE_NAMES).find(
            ([_, name]) => name.toLowerCase() === stateName.toLowerCase()
          )?.[0];

          if (!uf) return null;

          const accidentCount = accidentsByState.get(uf) || 0;
          const color = getColor(accidentCount);
          const textColor = getTextColor(accidentCount);
          const isHovered = hoveredState === uf;

          return (
            <g key={idx} filter="url(#shadow)">
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
                      stroke="#64748b"
                      strokeWidth={isHovered ? 2 : 1}
                      opacity={isHovered ? 1 : 0.85}
                      className="cursor-pointer transition-all hover:opacity-100"
                      onMouseEnter={() => setHoveredState(uf)}
                      onMouseLeave={() => setHoveredState(null)}
                    />
                  );
                })}

              {/* Rótulo do estado */}
              {feature.geometry.type === 'MultiPolygon' && (
                <g
                  onMouseEnter={() => setHoveredState(uf)}
                  onMouseLeave={() => setHoveredState(null)}
                  className="cursor-pointer"
                >
                  {feature.geometry.coordinates[0]?.[0] && (
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
                      fontSize={isHovered ? '14' : '12'}
                      fontWeight="bold"
                      fill={textColor}
                      className="pointer-events-none select-none transition-all"
                      style={{ textShadow: '0 0 3px rgba(255,255,255,0.8)' }}
                    >
                      {uf}
                    </text>
                  )}
                </g>
              )}
            </g>
          );
        })}
      </svg>
    );
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Mapa de Incidências de Acidentes por Estado</CardTitle>
        <CardDescription>Visualização geográfica da distribuição de acidentes - cores mais escuras indicam maior concentração</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="w-full space-y-4">
          {/* Legenda */}
          <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
            <p className="text-sm font-semibold text-slate-900 mb-3">Escala de Intensidade</p>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded" style={{ backgroundColor: '#f5f5f5', border: '1px solid #ccc' }}></div>
                <span className="text-xs text-slate-600">Poucos Acidentes</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded" style={{ backgroundColor: '#808080' }}></div>
                <span className="text-xs text-slate-600">Médio</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded" style={{ backgroundColor: '#0f172a' }}></div>
                <span className="text-xs text-slate-600">Muitos Acidentes</span>
              </div>
            </div>
          </div>

          {/* Mapa */}
          <div className="w-full bg-white rounded-lg border border-slate-200 overflow-hidden">
            {renderMap()}
          </div>

          {/* Tabela de dados */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {data
              .sort((a, b) => b.totalAccidents - a.totalAccidents)
              .map((state) => (
                <div
                  key={state.uf}
                  className="p-3 rounded-lg border border-slate-200 transition-all hover:shadow-md cursor-pointer"
                  style={{ backgroundColor: getColor(state.totalAccidents) + '20' }}
                  onMouseEnter={() => setHoveredState(state.uf)}
                  onMouseLeave={() => setHoveredState(null)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div
                        className="w-4 h-4 rounded"
                        style={{ backgroundColor: getColor(state.totalAccidents) }}
                      ></div>
                      <div>
                        <span className="font-bold text-slate-900">{state.uf}</span>
                        <p className="text-xs text-slate-600">{STATE_NAMES[state.uf]}</p>
                      </div>
                    </div>
                    <span className="text-sm font-bold text-slate-700">{state.totalAccidents.toLocaleString()}</span>
                  </div>
                  <div className="mt-2 w-full bg-slate-200 rounded-full h-1.5 overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all"
                      style={{
                        width: `${((state.totalAccidents - minAccidents) / (maxAccidents - minAccidents)) * 100}%`,
                        backgroundColor: getColor(state.totalAccidents),
                      }}
                    ></div>
                  </div>
                </div>
              ))}
          </div>

          {/* Informações adicionais */}
          <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-xs text-blue-900">
              <strong>Nota:</strong> O mapa mostra a distribuição geográfica dos acidentes em escala monocromática. 
              Cores mais escuras indicam estados com maior concentração de acidentes nas rodovias federais. 
              Passe o mouse sobre os estados para destacá-los. A tabela abaixo classifica os estados por número total de acidentes registrados em 2024.
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
