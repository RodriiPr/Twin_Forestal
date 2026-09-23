import React, { useState } from 'react';
import { LandscapeRegion, ManagementScenario } from '../types';
import { MOCK_SCENARIOS } from '../data/mockScientificData';
import {
  GitBranch,
  Play,
  Trees,
  Flame,
  ShieldCheck,
  Award,
  DollarSign,
  Droplets,
  RotateCcw,
  Sparkles,
  Layers,
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

export const ScenarioSimulator: React.FC<ScenarioSimulatorProps> = ({ region }) => {
  const scenarios = MOCK_SCENARIOS;
  const [selectedScenarioId, setSelectedScenarioId] = useState<string>(scenarios[2].id); // Default to restoration
  const [activeMetric, setActiveMetric] = useState<'totalCarbon' | 'fireRiskProbability' | 'biodiversityIndex' | 'lai'>('totalCarbon');

  const currentScenario = scenarios.find((s) => s.id === selectedScenarioId) || scenarios[0];

  // Radar multi-criteria comparison data
  const radarData = [
    {
      criterion: 'Stock Carbono 50a',
      laissez_faire: 45,
      thinning: 82,
      prescribed_burn: 74,
      restoration: 98,
      fullMark: 100,
    },
    {
      criterion: 'Resiliencia a Incendios',
      laissez_faire: 32,
      thinning: 84,
      prescribed_burn: 95,
      restoration: 78,
      fullMark: 100,
    },
    {
      criterion: 'Biodiversidad Shannon',
      laissez_faire: 52,
      thinning: 78,
      prescribed_burn: 69,
      restoration: 97,
      fullMark: 100,
    },
    {
      criterion: 'Rendimiento Maderable',
      laissez_faire: 0,
      thinning: 92,
      prescribed_burn: 25,
      restoration: 60,
      fullMark: 100,
    },
    {
      criterion: 'Aporte Hídrico Cuenca',
      laissez_faire: 55,
      thinning: 88,
      prescribed_burn: 92,
      restoration: 70,
      fullMark: 100,
    },
  ];

  // Combined 50-year trajectories for charting
  const trajectoryYears = [0, 5, 10, 20, 25, 35, 50];
  const combinedTrajectoryData = trajectoryYears.map((yr) => {
    const s_thin = scenarios[0].trajectory.find((t) => t.year === yr) || scenarios[0].trajectory[0];
    const s_burn = scenarios[1].trajectory.find((t) => t.year === yr) || scenarios[1].trajectory[0];
    const s_rest = scenarios[2].trajectory.find((t) => t.year === yr) || scenarios[2].trajectory[0];
    const s_base = scenarios[3].trajectory.find((t) => t.year === yr) || scenarios[3].trajectory[0];

    return {
      year: `Año ${yr}`,
      thinning: s_thin[activeMetric],
      prescribed_burn: s_burn[activeMetric],
      restoration: s_rest[activeMetric],
      laissez_faire: s_base[activeMetric],
    };
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
      <div className="grid grid-cols-1 md:grid-cols-4 gap-3 text-xs">
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

      {/* Main Charts: 50-Year Trajectory Line Graph & Radar Multi-Criteria Trade-offs */}
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
                          <div className="text-emerald-400">
                            Restauración Diversa: <span className="font-mono font-bold">{payload[0].payload.restoration}</span>
                          </div>
                          <div className="text-sky-400">
                            Clareo Selectivo: <span className="font-mono font-bold">{payload[0].payload.thinning}</span>
                          </div>
                          <div className="text-amber-400">
                            Quemas Prescritas: <span className="font-mono font-bold">{payload[0].payload.prescribed_burn}</span>
                          </div>
                          <div className="text-rose-400">
                            No Intervención (Laissez-faire): <span className="font-mono font-bold">{payload[0].payload.laissez_faire}</span>
                          </div>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Legend wrapperStyle={{ fontSize: 11, paddingTop: 6 }} />
                <Line type="monotone" dataKey="restoration" name="Restauración Diversa" stroke="#10b981" strokeWidth={2.5} dot={{ r: 3 }} />
                <Line type="monotone" dataKey="thinning" name="Clareos Selectivos" stroke="#38bdf8" strokeWidth={2} dot={{ r: 2.5 }} />
                <Line type="monotone" dataKey="prescribed_burn" name="Quemas Prescritas" stroke="#f59e0b" strokeWidth={2} dot={{ r: 2.5 }} />
                <Line type="monotone" dataKey="laissez_faire" name="No Intervención (Control)" stroke="#f43f5e" strokeWidth={1.8} strokeDasharray="3 3" dot={{ r: 2 }} />
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
                <Radar name="Restauración" dataKey="restoration" stroke="#10b981" fill="#10b981" fillOpacity={0.4} />
                <Radar name="Clareos" dataKey="thinning" stroke="#38bdf8" fill="#38bdf8" fillOpacity={0.2} />
                <Radar name="Sin Gestión" dataKey="laissez_faire" stroke="#f43f5e" fill="#f43f5e" fillOpacity={0.15} />
                <Legend wrapperStyle={{ fontSize: 10 }} />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};
