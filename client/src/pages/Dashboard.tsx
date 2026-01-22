import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ComposedChart } from 'recharts';
import { AlertCircle, TrendingUp, Users, Heart, Activity } from 'lucide-react';
import AccidentsMap from '@/components/AccidentsMap';

interface AccidentData {
  uf: string;
  totalAccidents: number;
  totalDeaths: number;
  totalSevereInjuries: number;
  totalMinorInjuries: number;
  totalUnharmed: number;
  dataJson: string;
}

interface ParsedData {
  causas: Array<{ causa: string; count: number }>;
  dias: Array<{ dia: string; count: number }>;
  fases: Array<{ fase: string; count: number }>;
  condicoes: Array<{ condicao: string; count: number }>;
  pistas: Array<{ pista: string; count: number }>;
  classificacoes: Array<{ classificacao: string; count: number }>;
}

const COLORS = ['#0f172a', '#1e293b', '#334155', '#475569', '#64748b', '#78909c', '#90a4ae', '#a1887f', '#bcaaa4', '#d7ccc8'];

export default function Dashboard() {
  const [selectedUf, setSelectedUf] = useState<string>('');
  const [allStats, setAllStats] = useState<AccidentData[]>([]);
  const [currentStats, setCurrentStats] = useState<AccidentData | null>(null);
  const [parsedData, setParsedData] = useState<ParsedData | null>(null);
  const [loading, setLoading] = useState(true);
  const [rawData, setRawData] = useState<any>(null);

  // Carregar dados do arquivo JSON público
  useEffect(() => {
    const loadData = async () => {
      try {
        // Tentar carregar de forma direta
        const response = await fetch('/accidents-data.json', {
          headers: { 'Accept': 'application/json' }
        });
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const text = await response.text();
        const data = JSON.parse(text);
        setRawData(data);
        
        // Processar dados para cada UF
        const stats: AccidentData[] = [];
        for (const [uf, ufData] of Object.entries(data.ufs)) {
          const ufStats = ufData as any;
          stats.push({
            uf: uf,
            totalAccidents: ufStats.total_acidentes,
            totalDeaths: ufStats.total_mortos,
            totalSevereInjuries: ufStats.total_feridos_graves,
            totalMinorInjuries: ufStats.total_feridos_leves,
            totalUnharmed: ufStats.total_ilesos,
            dataJson: JSON.stringify({
              causas: data.causas_por_uf[uf] || [],
              dias: data.dias_semana_por_uf[uf] || [],
              fases: data.fase_dia_por_uf[uf] || [],
              condicoes: data.condicao_metereologica_por_uf[uf] || [],
              pistas: data.tipo_pista_por_uf[uf] || [],
              classificacoes: data.classificacao_por_uf[uf] || [],
            }),
          });
        }
        
        setAllStats(stats);
        if (stats.length > 0) {
          setSelectedUf(stats[0].uf);
          setCurrentStats(stats[0]);
          setParsedData(JSON.parse(stats[0].dataJson));
        }
        setLoading(false);
      } catch (error) {
        console.error('Erro ao carregar dados:', error);
        setLoading(false);
      }
    };

    loadData();
  }, []);

  // Atualizar dados quando UF muda
  useEffect(() => {
    if (selectedUf && allStats.length > 0) {
      const stats = allStats.find(s => s.uf === selectedUf);
      if (stats) {
        setCurrentStats(stats);
        setParsedData(JSON.parse(stats.dataJson));
      }
    }
  }, [selectedUf, allStats]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-slate-900 mx-auto mb-4"></div>
          <p className="text-slate-600">Carregando dados...</p>
        </div>
      </div>
    );
  }

  if (!currentStats || !parsedData) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-50">
        <Card className="border-red-200 bg-red-50 max-w-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-red-900">
              <AlertCircle className="w-5 h-5" />
              Erro ao carregar dados
            </CardTitle>
          </CardHeader>
          <CardContent className="text-red-800">
            <p>Não foi possível carregar os dados de acidentes.</p>
            <p className="text-sm mt-2">Verifique se o arquivo accidents-data.json está disponível.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Preparar dados para gráficos
  const top10Causas = parsedData.causas.slice(0, 10);
  const totalCausas = parsedData.causas.reduce((sum, c) => sum + c.count, 0);
  const causasComPercentual = top10Causas.map(c => ({
    ...c,
    causaExibicao: c.causa.length > 35 ? c.causa.substring(0, 32) + '...' : c.causa,
    causaCompleta: c.causa,
    percentual: ((c.count / totalCausas) * 100).toFixed(1),
  }));

  const diasSemana = parsedData.dias;
  const fasesDia = parsedData.fases;
  const condicoes = parsedData.condicoes.filter(c => c.condicao.toLowerCase() !== 'ignorado');
  const pistas = parsedData.pistas;
  const classificacoes = parsedData.classificacoes;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-slate-900 mb-2">Análise Executiva de Acidentes - PRF 2024</h1>
          <p className="text-slate-600">Inteligência operacional de acidentes nas rodovias federais brasileiras</p>
        </div>

        {/* Filtro por UF */}
        <Card className="mb-8 border-slate-200">
          <CardHeader>
            <CardTitle className="text-lg">Filtro por Estado</CardTitle>
          </CardHeader>
          <CardContent>
            <Select value={selectedUf} onValueChange={setSelectedUf}>
              <SelectTrigger className="w-full md:w-64">
                <SelectValue placeholder="Selecione um estado" />
              </SelectTrigger>
              <SelectContent>
                {allStats.map(stat => (
                  <SelectItem key={stat.uf} value={stat.uf}>
                    {stat.uf}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </CardContent>
        </Card>

        {/* KPIs */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <Card className="border-red-200 bg-red-50">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-red-900 flex items-center gap-2">
                <AlertCircle className="w-4 h-4" />
                Mortos
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-red-900">{currentStats.totalDeaths.toLocaleString()}</div>
              <p className="text-xs text-red-700 mt-1">Total de vítimas fatais</p>
            </CardContent>
          </Card>

          <Card className="border-orange-200 bg-orange-50">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-orange-900 flex items-center gap-2">
                <Heart className="w-4 h-4" />
                Feridos Graves
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-orange-900">{currentStats.totalSevereInjuries.toLocaleString()}</div>
              <p className="text-xs text-orange-700 mt-1">Ferimentos graves</p>
            </CardContent>
          </Card>

          <Card className="border-yellow-200 bg-yellow-50">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-yellow-900 flex items-center gap-2">
                <Activity className="w-4 h-4" />
                Feridos Leves
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-yellow-900">{currentStats.totalMinorInjuries.toLocaleString()}</div>
              <p className="text-xs text-yellow-700 mt-1">Ferimentos leves</p>
            </CardContent>
          </Card>

          <Card className="border-green-200 bg-green-50">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-green-900 flex items-center gap-2">
                <Users className="w-4 h-4" />
                Ilesos
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-900">{currentStats.totalUnharmed.toLocaleString()}</div>
              <p className="text-xs text-green-700 mt-1">Pessoas ilesas</p>
            </CardContent>
          </Card>
        </div>

        {/* Abas */}
        <Tabs defaultValue="overview" className="space-y-4">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="overview">Visão Geral</TabsTrigger>
            <TabsTrigger value="causes">Causas e Severidade</TabsTrigger>
            <TabsTrigger value="environment">Fatores Ambientais</TabsTrigger>
          </TabsList>

          {/* Aba 1: Visão Geral */}
          <TabsContent value="overview" className="space-y-4">
            <AccidentsMap data={allStats} />
            
            <Card>
              <CardHeader>
                <CardTitle>Total de Acidentes: {currentStats.totalAccidents.toLocaleString()}</CardTitle>
                <CardDescription>Distribuição de acidentes por dia da semana</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={diasSemana}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="dia" angle={-45} textAnchor="end" height={80} />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="count" fill="#0f172a" radius={[8, 8, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Aba 2: Causas e Severidade */}
          <TabsContent value="causes" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Top 10 Causas de Acidentes</CardTitle>
                <CardDescription>Causas mais frequentes com percentual de participação</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={450}>
                  <BarChart data={causasComPercentual} layout="vertical" margin={{ left: 320, right: 20 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis type="number" />
                    <YAxis dataKey="causaExibicao" type="category" width={310} tick={{ fontSize: 11 }} />
                    <Tooltip 
                      formatter={(value) => `${value} acidentes`}
                      labelFormatter={(label) => {
                        const item = causasComPercentual.find(c => c.causaExibicao === label);
                        return item ? item.causaCompleta : label;
                      }}
                      contentStyle={{ 
                        backgroundColor: '#f8fafc', 
                        border: '1px solid #e2e8f0', 
                        borderRadius: '8px',
                        maxWidth: '300px',
                        wordWrap: 'break-word'
                      }}
                    />
                    <Bar dataKey="count" fill="#0f172a" radius={[0, 8, 8, 0]} />
                  </BarChart>
                </ResponsiveContainer>
                <div className="mt-4 text-xs text-slate-600 bg-slate-50 p-3 rounded border border-slate-200">
                  <p><strong>Dica:</strong> Passe o mouse sobre as barras para visualizar a descrição completa de cada causa de acidente.</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Classificação de Acidentes</CardTitle>
                <CardDescription>Distribuição por gravidade</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={classificacoes}
                      dataKey="count"
                      nameKey="classificacao"
                      cx="50%"
                      cy="50%"
                      outerRadius={100}
                      label
                    >
                      {classificacoes.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Aba 3: Fatores Ambientais */}
          <TabsContent value="environment" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Acidentes por Fase do Dia</CardTitle>
                <CardDescription>Distribuição ao longo do dia</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={fasesDia}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="fase" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="count" fill="#1e293b" radius={[8, 8, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Acidentes por Condição Meteorológica</CardTitle>
                <CardDescription>Influência do clima nos acidentes (dados validados)</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={condicoes}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="condicao" angle={-45} textAnchor="end" height={80} />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="count" fill="#334155" radius={[8, 8, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
                <div className="mt-4 text-xs text-slate-600 bg-slate-50 p-3 rounded border border-slate-200">
                  <p><strong>Nota:</strong> Registros com condição meteorológica "Ignorado" foram excluídos para garantir análise com dados validados e precisos.</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Acidentes por Tipo de Pista</CardTitle>
                <CardDescription>Influência da infraestrutura viária</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={pistas}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="pista" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="count" fill="#475569" radius={[8, 8, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
