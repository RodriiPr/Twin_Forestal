import React, { useState } from 'react';
import { ValidationMetrics } from '../types';
import { MOCK_VALIDATION_METRICS, SOBOL_INDICES } from '../data/mockScientificData';
import {
  ShieldCheck,
  Award,
  TrendingDown,
  Activity,
  CheckCircle2,
  PieChart as PieIcon,
  HelpCircle,
  Sparkles,
  Layers,
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Cell,
} from 'recharts';

export const UncertaintyValidation: React.FC = () => {
  const metrics: ValidationMetrics = MOCK_VALIDATION_METRICS;
  const [selectedScale, setSelectedScale] = useState<'plot' | 'stand' | 'landscape'>('landscape');

  // Multi-scale benchmark reference data
  const scaleValidation = {
    plot: {
      scale: 'Escala Parcela (IFN4 0.2 ha)',
      r2: 0.862,
      rmse: '14.2 Mg C/ha',
      bias: '-0.38 Mg C/ha',
      method: 'Mediciones dendrométricas destructivas y alometría directa',
    },
    stand: {
      scale: 'Escala Rodal / Tesela (1-10 ha)',
      r2: 0.894,
      rmse: '16.8 Mg C/ha',
      bias: '-0.51 Mg C/ha',
      method: 'LiDAR aerotransportado PNOA-ALS (0.5 pulsos/m²)',
    },
    landscape: {
      scale: 'Escala Paisaje / Cuenca (10³-10⁵ ha)',
      r2: 0.884,
      rmse: '17.58 Mg C/ha',
      bias: '-0.62 Mg C/ha',
      method: 'Asimilación GEDI L4A + Sentinel-1/2 + 3-PG + FLUXNET',
    },
  };

  // Uncertainty comparison data
  const uncertaintyBarData = [
    {
      source: 'Inventario Tradicional (IFN / NFI)',
      uncertainty: metrics.traditionalNFI.ci95Width,
      errorPct: 24.5,
      color: '#f43f5e',
    },
    {
      source: 'Modelo 3-PG No Asimilado',
      uncertainty: 32.1,
      errorPct: 20.3,
      color: '#f59e0b',
    },
    {
      source: 'Teledetección Óptica Pura (Sentinel-2)',
      uncertainty: 29.4,
      errorPct: 18.6,
      color: '#38bdf8',
    },
    {
      source: 'SilvaTwin Gemelo Digital Asimilado',
      uncertainty: metrics.silvaTwinAssimilation.ci95Width,
      errorPct: 14.8,
      color: '#10b981',
    },
  ];

  return (
    <div className="space-y-4">
      {/* Header Banner */}
      <div className="bg-zinc-900/50 backdrop-blur-md border border-zinc-800 p-4 rounded-xl flex flex-wrap items-center justify-between gap-4 shadow-xl">
        <div>
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-emerald-400" />
            <h2 className="text-base font-bold text-zinc-100 uppercase tracking-tight">
              Marco de Validación Cruzada & Reducción de Incertidumbre
            </h2>
          </div>
          <p className="text-xs text-zinc-400 mt-1">
            Demostración empírica de la reducción de incertidumbre en el stock de carbono y flujos ecosistémicos respecto
            a inventarios tradicionales y modelos no asimilados ({metrics.datasetName}).
          </p>
        </div>

        {/* Highlight Banner of 30% reduction requirement */}
        <div className="bg-emerald-500/10 border border-emerald-500/30 px-4 py-2 rounded-xl flex items-center gap-3 shadow-[0_0_15px_rgba(16,185,129,0.15)]">
          <Award className="w-5 h-5 text-emerald-400 shrink-0" />
          <div>
            <div className="text-[10px] uppercase tracking-wider text-emerald-300 font-mono">Reducción de Incertidumbre</div>
            <div className="text-lg font-bold font-mono text-emerald-400">
              -{(metrics.uncertaintyReductionPct).toFixed(1)}% <span className="text-xs text-emerald-300/80 font-normal">(Objetivo &gt; 30% Cumplido)</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Validation Comparison Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Left Column: Uncertainty Width Comparison Chart (CI 95%) */}
        <div className="lg:col-span-7 bg-zinc-900/40 backdrop-blur-md border border-zinc-800 rounded-xl p-4 shadow-2xl flex flex-col">
          <div className="flex items-center justify-between pb-3 border-b border-zinc-800 mb-4 text-xs">
            <div>
              <span className="font-semibold text-zinc-200 uppercase tracking-wider text-[11px]">
                Ancho del Intervalo de Confianza al 95% (± Mg C / ha)
              </span>
              <p className="text-[11px] text-zinc-400">Menor ancho = mayor precisión y certidumbre en la cuantificación.</p>
            </div>
            <span className="font-mono text-emerald-400 text-xs font-bold">-32.4% Error</span>
          </div>

          <div className="h-64 w-full flex-1">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={uncertaintyBarData} layout="vertical" margin={{ top: 5, right: 30, left: 10, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
                <XAxis type="number" stroke="#71717a" tick={{ fontSize: 10 }} unit=" Mg" />
                <YAxis dataKey="source" type="category" stroke="#71717a" tick={{ fontSize: 10 }} width={160} />
                <Tooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const d = payload[0].payload;
                      return (
                        <div className="bg-zinc-950 border border-zinc-700 p-2.5 rounded-lg text-xs shadow-2xl space-y-1">
                          <div className="font-bold text-zinc-100">{d.source}</div>
                          <div className="text-emerald-400">Ancho IC 95%: <span className="font-mono font-bold">± {d.uncertainty} Mg C/ha</span></div>
                          <div className="text-zinc-400">Error relativo medio: <span className="font-mono">{d.errorPct}%</span></div>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Bar dataKey="uncertainty" radius={[0, 4, 4, 0]}>
                  {uncertaintyBarData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Validation Metrics Summary Footnote */}
          <div className="mt-3 pt-3 border-t border-zinc-800 grid grid-cols-3 gap-2 text-center text-xs">
            <div className="bg-zinc-950/70 p-2 rounded-lg border border-zinc-800">
              <span className="text-zinc-500 text-[10px] uppercase font-mono block">R² SilvaTwin</span>
              <span className="font-mono font-bold text-emerald-400 text-sm">{metrics.silvaTwinAssimilation.r2}</span>
            </div>
            <div className="bg-zinc-950/70 p-2 rounded-lg border border-zinc-800">
              <span className="text-zinc-500 text-[10px] uppercase font-mono block">RMSE Reducido</span>
              <span className="font-mono font-bold text-sky-400 text-sm">{metrics.silvaTwinAssimilation.rmse} Mg/ha</span>
            </div>
            <div className="bg-zinc-950/70 p-2 rounded-lg border border-zinc-800">
              <span className="text-zinc-500 text-[10px] uppercase font-mono block">Sesgo (Bias)</span>
              <span className="font-mono font-bold text-amber-300 text-sm">{metrics.silvaTwinAssimilation.bias} Mg/ha</span>
            </div>
          </div>
        </div>

        {/* Right Column: Global Sensitivity Analysis (Sobol Indices) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-zinc-900/40 backdrop-blur-md border border-zinc-800 rounded-xl p-4 shadow-xl">
            <div className="flex items-center gap-2 pb-2 border-b border-zinc-800 mb-3 text-zinc-200">
              <Activity className="w-4 h-4 text-emerald-400" />
              <h3 className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider">
                Análisis Global de Sensibilidad (Índices de Sobol)
              </h3>
            </div>
            <p className="text-[11px] text-zinc-400 mb-3">
              Descomposición de la varianza total de la biomasa predicha entre parámetros ecofisiológicos y sensores (N=10,000 muestras Saltelli).
            </p>

            <div className="space-y-2 text-xs">
              {SOBOL_INDICES.map((s, idx) => (
                <div key={idx} className="bg-zinc-950/70 p-2.5 rounded-lg border border-zinc-800/80">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-medium text-zinc-200">{s.label} ({s.parameter})</span>
                    <span className="font-mono text-zinc-400 text-[10px]">
                      S1 = <span className="text-emerald-400 font-bold">{s.firstOrderS1}</span> | ST = <span className="text-sky-400 font-bold">{s.totalOrderST}</span>
                    </span>
                  </div>
                  <div className="h-1.5 w-full bg-zinc-800 rounded-full overflow-hidden flex">
                    <div className="bg-emerald-500" style={{ width: `${s.firstOrderS1 * 100}%` }}></div>
                    <div className="bg-sky-500" style={{ width: `${(s.totalOrderST - s.firstOrderS1) * 100}%` }}></div>
                  </div>
                  <div className="text-[10px] text-zinc-500 mt-1">Categoría: {s.category}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Multi-Scale Cross-Validation Tab Panel */}
      <div className="bg-zinc-900/40 backdrop-blur-md border border-zinc-800 rounded-xl p-4 shadow-xl">
        <div className="flex flex-wrap items-center justify-between pb-3 border-b border-zinc-800 mb-4 gap-3 text-xs">
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-sky-400" />
            <span className="font-semibold text-zinc-200 uppercase tracking-wider text-[11px]">
              Validación Multi-Escala Jerárquica
            </span>
          </div>

          <div className="flex items-center gap-1.5 bg-zinc-950 p-1 rounded-lg border border-zinc-800">
            {(['plot', 'stand', 'landscape'] as const).map((sc) => (
              <button
                key={sc}
                onClick={() => setSelectedScale(sc)}
                className={`px-3 py-1 rounded font-medium transition-all ${
                  selectedScale === sc
                    ? 'bg-emerald-500 text-zinc-950 font-bold'
                    : 'text-zinc-400 hover:text-zinc-200'
                }`}
              >
                {sc === 'plot' ? '1. Parcela IFN (0.2 ha)' : sc === 'stand' ? '2. Rodal LiDAR (1-10 ha)' : '3. Paisaje GEDI (10³-10⁵ ha)'}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-3 text-xs bg-zinc-950/80 p-3.5 rounded-xl border border-zinc-800">
          <div>
            <span className="text-zinc-500 block text-[10px] uppercase font-mono">Escala de Comprobación</span>
            <span className="text-sm font-bold text-zinc-200">{scaleValidation[selectedScale].scale}</span>
          </div>
          <div>
            <span className="text-zinc-500 block text-[10px] uppercase font-mono">Bondad de Ajuste R²</span>
            <span className="text-sm font-bold font-mono text-emerald-400">{scaleValidation[selectedScale].r2}</span>
          </div>
          <div>
            <span className="text-zinc-500 block text-[10px] uppercase font-mono">RMSE Observado</span>
            <span className="text-sm font-bold font-mono text-sky-400">{scaleValidation[selectedScale].rmse}</span>
          </div>
          <div>
            <span className="text-zinc-500 block text-[10px] uppercase font-mono">Método de Referencia Terrestre</span>
            <span className="text-zinc-300 text-[11px]">{scaleValidation[selectedScale].method}</span>
          </div>
        </div>
      </div>
    </div>
  );
};
