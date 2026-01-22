import { useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

interface StateAccidentData {
  uf: string;
  count: number;
  lat: number;
  lng: number;
}

interface AccidentsMapProps {
  data: Array<{ uf: string; totalAccidents: number }>;
}

// Coordenadas aproximadas do centro de cada estado
const STATE_COORDINATES: Record<string, { lat: number; lng: number }> = {
  'AC': { lat: -9.97, lng: -67.81 },
  'AL': { lat: -9.54, lng: -36.65 },
  'AP': { lat: 1.41, lng: -51.77 },
  'AM': { lat: -3.47, lng: -62.22 },
  'BA': { lat: -12.97, lng: -38.51 },
  'CE': { lat: -3.73, lng: -38.54 },
  'DF': { lat: -15.79, lng: -47.88 },
  'ES': { lat: -20.31, lng: -40.30 },
  'GO': { lat: -15.89, lng: -49.50 },
  'MA': { lat: -2.89, lng: -45.29 },
  'MT': { lat: -12.64, lng: -55.49 },
  'MS': { lat: -20.51, lng: -54.54 },
  'MG': { lat: -19.86, lng: -43.95 },
  'PA': { lat: -5.53, lng: -52.29 },
  'PB': { lat: -7.06, lng: -35.55 },
  'PR': { lat: -24.89, lng: -51.63 },
  'PE': { lat: -8.38, lng: -35.43 },
  'PI': { lat: -6.67, lng: -42.34 },
  'RJ': { lat: -22.84, lng: -43.15 },
  'RN': { lat: -5.50, lng: -35.27 },
  'RS': { lat: -30.01, lng: -51.42 },
  'RO': { lat: -11.19, lng: -60.02 },
  'RR': { lat: 2.82, lng: -60.67 },
  'SC': { lat: -27.45, lng: -49.25 },
  'SP': { lat: -23.55, lng: -46.63 },
  'SE': { lat: -10.51, lng: -37.07 },
  'TO': { lat: -10.25, lng: -48.33 },
};

export default function AccidentsMap({ data }: AccidentsMapProps) {
  const mapData = useMemo(() => {
    if (!data || data.length === 0) return [];

    const maxAccidents = Math.max(...data.map(d => d.totalAccidents));
    const minAccidents = Math.min(...data.map(d => d.totalAccidents));

    return data.map(item => ({
      uf: item.uf,
      count: item.totalAccidents,
      lat: STATE_COORDINATES[item.uf]?.lat || 0,
      lng: STATE_COORDINATES[item.uf]?.lng || 0,
      intensity: (item.totalAccidents - minAccidents) / (maxAccidents - minAccidents),
    }));
  }, [data]);

  // Função para calcular cor monocromática baseada na intensidade
  const getColor = (intensity: number): string => {
    // Escala de cinza: 0 = branco (#f5f5f5), 1 = preto (#0f172a)
    const gray = Math.round(245 - intensity * 240);
    return `rgb(${gray}, ${gray}, ${gray})`;
  };

  // Função para calcular cor de texto (branco para fundos escuros, preto para fundos claros)
  const getTextColor = (intensity: number): string => {
    return intensity > 0.5 ? '#ffffff' : '#000000';
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Mapa de Incidências de Acidentes por Estado</CardTitle>
        <CardDescription>Visualização geográfica da distribuição de acidentes - cores mais escuras indicam maior concentração</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="w-full bg-gradient-to-b from-slate-50 to-slate-100 rounded-lg p-8 relative" style={{ minHeight: '600px' }}>
          {/* Legenda */}
          <div className="absolute top-4 right-4 bg-white p-3 rounded-lg shadow-md border border-slate-200 z-10">
            <p className="text-xs font-semibold text-slate-900 mb-2">Escala de Intensidade</p>
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded" style={{ backgroundColor: '#f5f5f5', border: '1px solid #ccc' }}></div>
              <span className="text-xs text-slate-600">Poucos</span>
            </div>
            <div className="flex items-center gap-2 my-1">
              <div className="w-6 h-6 rounded" style={{ backgroundColor: '#808080' }}></div>
              <span className="text-xs text-slate-600">Médio</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded" style={{ backgroundColor: '#0f172a' }}></div>
              <span className="text-xs text-slate-600">Muitos</span>
            </div>
          </div>

          {/* SVG Map Container */}
          <svg viewBox="-75 -35 150 100" className="w-full h-full" style={{ maxHeight: '500px' }}>
            {/* Grid de fundo */}
            <defs>
              <pattern id="grid" width="10" height="10" patternUnits="userSpaceOnUse">
                <path d="M 10 0 L 0 0 0 10" fill="none" stroke="#e2e8f0" strokeWidth="0.1" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#grid)" />

            {/* Estados como círculos */}
            {mapData.map((state) => (
              <g key={state.uf}>
                {/* Círculo do estado */}
                <circle
                  cx={state.lng}
                  cy={state.lat}
                  r="2.5"
                  fill={getColor(state.intensity)}
                  stroke="#64748b"
                  strokeWidth="0.15"
                  opacity="0.9"
                  className="cursor-pointer hover:opacity-100 transition-opacity"
                />
                {/* Rótulo do estado */}
                <text
                  x={state.lng}
                  y={state.lat}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  fontSize="0.8"
                  fontWeight="bold"
                  fill={getTextColor(state.intensity)}
                  className="pointer-events-none select-none"
                >
                  {state.uf}
                </text>
              </g>
            ))}
          </svg>

          {/* Tabela de dados */}
          <div className="mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {mapData
              .sort((a, b) => b.count - a.count)
              .map((state) => (
                <div
                  key={state.uf}
                  className="p-3 rounded-lg border border-slate-200 transition-all hover:shadow-md"
                  style={{ backgroundColor: getColor(state.intensity) + '20' }}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div
                        className="w-4 h-4 rounded"
                        style={{ backgroundColor: getColor(state.intensity) }}
                      ></div>
                      <span className="font-semibold text-slate-900">{state.uf}</span>
                    </div>
                    <span className="text-sm font-bold text-slate-700">{state.count.toLocaleString()}</span>
                  </div>
                  <div className="mt-1 w-full bg-slate-200 rounded-full h-1.5 overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all"
                      style={{
                        width: `${(state.intensity * 100)}%`,
                        backgroundColor: getColor(state.intensity),
                      }}
                    ></div>
                  </div>
                </div>
              ))}
          </div>

          {/* Informações adicionais */}
          <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-xs text-blue-900">
              <strong>Nota:</strong> O mapa mostra a distribuição geográfica dos acidentes em escala monocromática. 
              Cores mais escuras indicam estados com maior concentração de acidentes nas rodovias federais. 
              A tabela abaixo classifica os estados por número total de acidentes registrados em 2024.
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
