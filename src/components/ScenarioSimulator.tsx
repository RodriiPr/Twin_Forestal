import React, { useState, useEffect } from 'react';
import { LandscapeRegion, ManagementScenario } from '../types';
import { ForestTwinAPI } from '../services/api';
import {
  GitBranch,
  AlertTriangle,
  RefreshCw,
} from 'lucide-react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
} from 'recharts';

interface ScenarioSimulatorProps {
  region: LandscapeRegion;
}

const SCENARIO_COLORS = ['#10b981', '#38bdf8', '#f59e0b', '#f43f5e', '#a78bfa', '#34d399'];

const DEFAULT_METRICS_SUMMARY = {
  totalCarbon50Yr: 0,
  carbonSequestrationRate: 0,
  cumulativeHarvestedCarbon: 0,
  meanFireRiskProb: 0,
  fireResilienceScore: 0,
  biodiversityShannonH: 0,
  waterYieldM3Ha: 0,
  economicNPV_EUR_ha: 0,
  uncertaintyReductionPct: 0,
};

const DEFAULT_TRAJECTORY_POINT = {
  year: 0,
  agb: 0,
  soc: 0,
  deadwoodC: 0,
  totalCarbon: 0,
  lai: 0,
  fireRiskProbability: 0,
  canopyHeightM: 0,
  stemDensityHa: 0,
  waterYieldMm: 0,
  biodiversityIndex: 0,
};

function normalizeScenario(raw: any): ManagementScenario | null {
  if (!raw || !raw.id || !raw.name) return null;
  return {
    id: String(raw.id),
    name: String(raw.name),
    tag: String(raw.tag || ''),
    type: raw.type || 'laissez_faire',
    description: String(raw.description || ''),
    thinningIntensityPct: Number(raw.thinningIntensityPct) || 0,
    thinningScheduleYears: Array.isArray(raw.thinningScheduleYears) ? raw.thinningScheduleYears : [],
    prescribedBurnIntervalYears: Number(raw.prescribedBurnIntervalYears) || 0,
    reforestationSpecies: String(raw.reforestationSpecies || ''),
    fuelBreakWidthM: Number(raw.fuelBreakWidthM) || 0,
    trajectory: Array.isArray(raw.trajectory) && raw.trajectory.length > 0
      ? raw.trajectory.map((t: any) => ({ ...DEFAULT_TRAJECTORY_POINT, ...t }))
      : [{ ...DEFAULT_TRAJECTORY_POINT }],
    metricsSummary: { ...DEFAULT_METRICS_SUMMARY, ...(raw.metricsSummary || {}) },
  };
}

export const ScenarioSimulator: React.FC<ScenarioSimulatorProps> = ({ region }) => {
  const [scenarios, setScenarios] = useState<ManagementScenario[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedScenarioId, setSelectedScenarioId] = useState<string>('');
  const [activeMetric, setActiveMetric] = useState<'totalCarbon' | 'fireRiskProbability' | 'biodiversityIndex' | 'lai'>('totalCarbon');

  useEffect(() => {
    let isMounted = true;
    setIsLoading(true);
    setError(null);

    ForestTwinAPI.getScenarios()
      .then((data) => {
        if (!isMounted) return;
        const valid = (data || []).map(normalizeScenario).filter((s): s is ManagementScenario => s !== null);
        if (valid.length > 0) {
          setScenarios(valid);
          setSelectedScenarioId((prev) => prev || valid[0].id);
        } else {
          setError('No se encontraron escenarios válidos en el backend.');
        }
      })
      .catch((err) => {
        if (isMounted) setError('Error al cargar escenarios: ' + (err?.message || 'desconocido'));
      })
      .finally(() => {
        if (isMounted) setIsLoading(false);
      });

    return () => { isMounted = false; };
  }, [region.id]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64 bg-zinc-900/40 backdrop-blur-md border border-zinc-800 rounded-xl">
        <div className="flex items-center gap-2 text-emerald-400/80 font-mono text-sm">
          <RefreshCw className="w-5 h-5 animate-spin" />
          <span>Cargando escenarios desde PostgreSQL...</span>
        </div>
      </div>
    );
  }

  if (error || scenarios.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 bg-zinc-900/40 backdrop-blur-md border border-zinc-800 rounded-xl">
        <div className="text-amber-400/80 font-mono text-sm text-center space-y-2">
          <AlertTriangle className="w-6 h-6 mx-auto" />
          <span>{error || 'No hay escenarios disponibles.'}</span>
        </div>
      </div>
    );
  }

  const currentScenario = scenarios.find((s) => s.id === selectedScenarioId) || scenarios[0];

  const trajectoryYears = [0, 5, 10, 20, 25, 35, 50];
  const combinedTrajectoryData = trajectoryYears.map((yr) => {
    const point: Record<string, any> = { year: `Año ${yr}` };
    scenarios.forEach((sc) => {
      const t = sc.trajectory.find((tp) => tp.year === yr) || sc.trajectory[0];
      if (t) point[sc.id] = t[activeMetric] ?? 0;
    });
    return point;
  });

  const radarCriteria = [
    'Stock Carbono 50a',
    'Resiliencia a Incendios',
    'Biodiversidad Shannon',
    'Rendimiento Maderable',
    'Aporte Hídrico Cuenca',
  ];
  const radarData = radarCriteria.map((criterion, idx) => {
    const point: Record<string, any> = { criterion };
    scenarios.slice(0, 4).forEach((sc, scIdx) => {
      const key = `sc${scIdx}`;
      const traj = sc.trajectory[sc.trajectory.length - 1];
      if (idx === 0) point[key] = sc.metricsSummary.totalCarbon50Yr;
      else if (idx === 1) point[key] = sc.metricsSummary.fireResilienceScore;
      else if (idx === 2) point[key] = sc.metricsSummary.biodiversityShannonH * 25;
      else if (idx === 3) point[key] = sc.metricsSummary.economicNPV_EUR_ha / 100;
      else point[key] = sc.metricsSummary.waterYieldM3Ha / 10;
    });
    return point;
  });

  const metricMeta = {
    totalCarbon: { label: 'Stock Total de Carbono', unit: 'Mg C / ha', desc: 'Suma de biomasa aérea, raíces y carbono orgánico del suelo.' },
    fireRiskProbability: { label: 'Probabilidad de Incendio Catastrófico', unit: 'Índice (0-1)', desc: 'Riesgo acumulativo de fuego de copas destructivo.' },
    biodiversityIndex: { label: 'Índice de Biodiversidad (Shannon H\')', unit: 'H\' (0-4.0)', desc: 'Diversidad estructural y heterogeneidad de especies del estrato arbóreo.' },
    lai: { label: 'Índice de Área Foliar (LAI)', unit: 'm² / m²', desc: 'Superficie de hojas por unidad de suelo para fotosíntesis y evapotranspiración.' },
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="bg-zinc-900/50 backdrop-blur-md border border-zinc-800 p-4 rounded-xl flex flex-wrap items-center justify-between gap-4 shadow-xl">
        <div>
          <div className="flex items-center gap-2">
            <GitBranch className="w-5 h-5 text-emerald-400" />
            <h2 className="text-base font-bold text-zinc-100 uppercase tracking-tight">
              Simulador de Manejo Forestal Adaptativo y Escenarios a 50 Años
            </h2>
          </div>
          <p className="text-xs text-zinc-400 mt-1">
            Proyección ecofisiológica multiescenario acoplada a cambio climático (SSP2-4.5 / SSP5-8.5) en{' '}
            <span className="text-emerald-400 font-semibold">{region.name}</span>.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-[10px] text-emerald-400/70 font-mono">Datos Reales PostgreSQL</span>
        </div>

        {/* Metric Switcher */}
        <div className="flex items-center gap-1.5 bg-zinc-950 p-1 rounded-lg border border-zinc-800 text-xs">
          {(['totalCarbon', 'fireRiskProbability', 'biodiversityIndex', 'lai'] as const).map((m) => (
            <button
              key={m}
              onClick={() => setActiveMetric(m)}
              className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
                activeMetric === m
                  ? 'bg-emerald-500 text-zinc-950 font-bold shadow-[0_0_10px_rgba(16,185,129,0.3)]'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              {metricMeta[m].label.split(' ')[0]} {metricMeta[m].label.split(' ')[1] || ''}
            </button>
          ))}
        </div>
      </div>

      {/* Scenario Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
        {scenarios.map((sc) => {
          const isSelected = sc.id === selectedScenarioId;
          return (
            <div
              key={sc.id}
              onClick={() => setSelectedScenarioId(sc.id)}
              className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
                isSelected
                  ? 'bg-emerald-500/10 border-emerald-500/50 shadow-[0_0_15px_rgba(16,185,129,0.2)]'
                  : 'bg-zinc-900/40 border-zinc-800 hover:bg-zinc-900/70 hover:border-zinc-700'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className={`font-bold ${isSelected ? 'text-emerald-400' : 'text-zinc-200'}`}>
                  {sc.name}
                </span>
                {isSelected && <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>}
              </div>
              <p className="text-zinc-400 text-[11px] leading-relaxed mb-3 line-clamp-3">
                {sc.description}
              </p>

              <div className="grid grid-cols-2 gap-1.5 pt-2 border-t border-zinc-800/80 font-mono text-[10px]">
                <div>
                  <span className="text-zinc-500 block">Carbono 50a:</span>
                  <span className="text-emerald-400 font-bold">{sc.metricsSummary.totalCarbon50Yr} Mg C/ha</span>
                </div>
                <div>
                  <span className="text-zinc-500 block">Riesgo Fuego:</span>
                  <span className="text-amber-400 font-bold">{(sc.metricsSummary.meanFireRiskProb * 100).toFixed(0)}%</span>
                </div>
                <div>
                  <span className="text-zinc-500 block">Diversidad H':</span>
                  <span className="text-sky-400 font-bold">{sc.metricsSummary.biodiversityShannonH}</span>
                </div>
                <div>
                  <span className="text-zinc-500 block">VPN Valor:</span>
                  <span className="text-zinc-300 font-bold">{sc.metricsSummary.economicNPV_EUR_ha} €/ha</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Main Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Trajectory Evolution Chart */}
        <div className="lg:col-span-8 bg-zinc-900/40 backdrop-blur-md border border-zinc-800 rounded-xl p-4 shadow-2xl">
          <div className="flex items-center justify-between pb-3 border-b border-zinc-800 mb-4 text-xs">
            <div>
              <span className="font-semibold text-zinc-200 uppercase tracking-wider text-[11px]">
                {metricMeta[activeMetric].label} (Proyección 2024 — 2074)
              </span>
              <p className="text-[11px] text-zinc-400">{metricMeta[activeMetric].desc}</p>
            </div>
            <span className="font-mono text-zinc-500 text-[11px]">Unidad: {metricMeta[activeMetric].unit}</span>
          </div>

          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={combinedTrajectoryData} margin={{ top: 10, right: 30, left: 10, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
                <XAxis dataKey="year" stroke="#71717a" tick={{ fontSize: 10 }} />
                <YAxis stroke="#71717a" tick={{ fontSize: 10 }} />
                <Tooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      return (
                        <div className="bg-zinc-950 border border-zinc-700 p-3 rounded-lg text-xs shadow-2xl space-y-1.5">
                          <div className="font-bold text-zinc-200 border-b border-zinc-800 pb-1">
                            {payload[0].payload.year}
                          </div>
                          {scenarios.map((sc, idx) => (
                            <div key={sc.id} style={{ color: SCENARIO_COLORS[idx % SCENARIO_COLORS.length] }}>
                              {sc.name}: <span className="font-mono font-bold">{payload[0].payload[sc.id]}</span>
                            </div>
                          ))}
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Legend wrapperStyle={{ fontSize: 11, paddingTop: 6 }} />
                {scenarios.map((sc, idx) => (
                  <Line
                    key={sc.id}
                    type="monotone"
                    dataKey={sc.id}
                    name={sc.name}
                    stroke={SCENARIO_COLORS[idx % SCENARIO_COLORS.length]}
                    strokeWidth={idx === 0 ? 2.5 : 2}
                    strokeDasharray={idx === scenarios.length - 1 ? '3 3' : undefined}
                    dot={{ r: idx === 0 ? 3 : 2.5 }}
                  />
                ))}
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Radar Trade-Off Chart */}
        <div className="lg:col-span-4 bg-zinc-900/40 backdrop-blur-md border border-zinc-800 rounded-xl p-4 shadow-2xl flex flex-col">
          <div className="pb-2 border-b border-zinc-800 mb-2 text-xs">
            <span className="font-semibold text-zinc-200 uppercase tracking-wider text-[11px]">
              Trade-offs Ecosistémicos (MCDA)
            </span>
            <p className="text-[11px] text-zinc-400">Evaluación de servicios ecosistémicos comparados.</p>
          </div>

          <div className="h-64 w-full flex-1">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart cx="50%" cy="50%" outerRadius="70%" data={radarData}>
                <PolarGrid stroke="#27272a" />
                <PolarAngleAxis dataKey="criterion" stroke="#71717a" tick={{ fontSize: 9 }} />
                <PolarRadiusAxis stroke="#71717a" tick={{ fontSize: 8 }} angle={30} domain={[0, 100]} />
                {scenarios.slice(0, 4).map((sc, idx) => (
                  <Radar
                    key={sc.id}
                    name={sc.name}
                    dataKey={`sc${idx}`}
                    stroke={SCENARIO_COLORS[idx % SCENARIO_COLORS.length]}
                    fill={SCENARIO_COLORS[idx % SCENARIO_COLORS.length]}
                    fillOpacity={0.15}
                  />
                ))}
                <Legend wrapperStyle={{ fontSize: 10 }} />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};
