import React, { useState } from 'react';
import {
  LandscapeRegion,
  GediMetrics,
  CanopyStratumPoint,
} from '../types';
import {
  MOCK_CANOPY_PROFILE,
  MOCK_GEDI_METRICS,
} from '../data/mockScientificData';
import {
  Radio,
  Layers,
  Sparkles,
  Flame,
  Activity,
  Sliders,
  Maximize2,
  TreePine,
  CheckCircle2,
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  BarChart,
  Bar,
  ReferenceLine,
} from 'recharts';

interface Canopy3DProfileProps {
  region: LandscapeRegion;
}

export const Canopy3DProfile: React.FC<Canopy3DProfileProps> = ({ region }) => {
  const [selectedShot, setSelectedShot] = useState<string>(MOCK_GEDI_METRICS.shotNumber);
  const [beamType, setBeamType] = useState<'coverage' | 'full_power'>('full_power');
  const [laserSensitivity, setLaserSensitivity] = useState<number>(0.96);
  const [hoveredHeight, setHoveredHeight] = useState<number | null>(null);

  const gedi = MOCK_GEDI_METRICS;
  const profileData = MOCK_CANOPY_PROFILE;

  // Stratum layer definitions
  const strataInfo = [
    { label: 'Emergentes (>32m)', color: 'from-amber-400 to-emerald-400', range: '32 - 45 m', desc: 'Árboles dominantes longevos, capturan radiación directa, alta madera de calidad.' },
    { label: 'Dosel Dominante (18-32m)', color: 'from-emerald-500 to-teal-600', range: '18 - 32 m', desc: 'Máxima concentración de índice de área foliar (LAI) y asimilación neta de CO2.' },
    { label: 'Dosel Medio (5-18m)', color: 'from-teal-600 to-emerald-800', range: '5 - 18 m', desc: 'Subestrato intermedio, árboles en fase de competencia y regeneración avanzada.' },
    { label: 'Subdosel (0-5m)', color: 'from-amber-700 to-zinc-700', range: '0 - 5 m', desc: 'Matorral, brinzales y combustible fino superficial (clave para inicio de incendios).' },
    { label: 'Suelo / Retorno Terrestre', color: 'from-zinc-800 to-zinc-900', range: '0 m', desc: 'Pico de energía de referencia altimétrica digital del terreno (DTM).' },
  ];

  return (
    <div className="space-y-4">
      {/* Header Info */}
      <div className="bg-zinc-900/50 backdrop-blur-md border border-zinc-800 p-4 rounded-xl flex flex-wrap items-center justify-between gap-4 shadow-xl">
        <div>
          <div className="flex items-center gap-2">
            <Radio className="w-5 h-5 text-emerald-400 animate-pulse" />
            <h2 className="text-base font-bold text-zinc-100 uppercase tracking-tight">
              Estructura Vertical del Dosel 3D — Perfil LiDAR GEDI L4A
            </h2>
          </div>
          <p className="text-xs text-zinc-400 mt-1">
            Forma de onda de retorno láser de pulso completo (Full Waveform) espacializada a 30m de resolución en{' '}
            <span className="text-emerald-400 font-semibold">{region.name}</span>.
          </p>
        </div>

        {/* Laser telemetrics HUD */}
        <div className="flex items-center gap-3 text-xs font-mono">
          <div className="bg-zinc-950 px-3 py-1.5 rounded-lg border border-zinc-800 flex items-center gap-2 shadow-inner">
            <span className="text-zinc-500">HAZ:</span>
            <span className="text-emerald-400 font-semibold">BEAM0101 (1064nm)</span>
          </div>
          <div className="bg-zinc-950 px-3 py-1.5 rounded-lg border border-zinc-800 flex items-center gap-2 shadow-inner">
            <span className="text-zinc-500">SENSIBILIDAD:</span>
            <span className="text-sky-400 font-semibold">{(laserSensitivity * 100).toFixed(0)}% (CALIDAD OK)</span>
          </div>
        </div>
      </div>

      {/* Main 3D / Vertical Slice Visualization Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Left: Waveform & Profile Chart (Vertical height on Y-axis) */}
        <div className="lg:col-span-8 bg-zinc-900/40 backdrop-blur-md border border-zinc-800 rounded-xl p-4 flex flex-col shadow-2xl">
          <div className="flex items-center justify-between pb-3 border-b border-zinc-800 mb-4 text-xs">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-zinc-200 uppercase tracking-wider text-[11px]">
                Forma de Onda de Energía Relativa LiDAR
              </span>
              <span className="text-zinc-500 font-mono text-[10px]">P(z) / P_max vs Altura (m)</span>
            </div>
            <div className="flex items-center gap-3 text-[11px] text-zinc-400">
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 bg-emerald-500 rounded-sm shadow-[0_0_6px_rgba(16,185,129,0.6)]"></span> Energía de Retorno (%)
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 bg-rose-500 rounded-sm"></span> Densidad Combustible (kg/m³)
              </span>
            </div>
          </div>

          {/* Interactive Chart Container */}
          <div className="h-96 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={profileData}
                layout="vertical"
                margin={{ top: 10, right: 30, left: 10, bottom: 10 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
                <XAxis
                  type="number"
                  domain={[0, 100]}
                  stroke="#71717a"
                  tick={{ fontSize: 10 }}
                  label={{ value: 'Energía Relativa (%) & Densidad Combustible x50', position: 'insideBottom', offset: -5, fill: '#71717a', fontSize: 11 }}
                />
                <YAxis
                  dataKey="heightM"
                  type="number"
                  domain={[0, 45]}
                  ticks={[0, 5, 10, 15, 20, 25, 30, 35, 40, 45]}
                  stroke="#71717a"
                  tick={{ fontSize: 11 }}
                  label={{ value: 'Altura sobre el Suelo (m)', angle: -90, position: 'insideLeft', offset: 10, fill: '#71717a', fontSize: 11 }}
                />
                <Tooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0].payload as CanopyStratumPoint;
                      return (
                        <div className="bg-zinc-950 border border-zinc-700 p-3 rounded-lg text-xs shadow-2xl space-y-1.5">
                          <div className="font-bold text-emerald-400 flex items-center justify-between gap-3 border-b border-zinc-800 pb-1">
                            <span>Estrato: {data.stratumLabel}</span>
                            <span className="font-mono text-zinc-300">z = {data.heightM} m</span>
                          </div>
                          <div className="text-zinc-300">
                            Energía de Retorno: <span className="font-mono text-emerald-400 font-bold">{data.relativeEnergyPct}%</span>
                          </div>
                          <div className="text-zinc-300">
                            Densidad Foliar (PAVD): <span className="font-mono text-sky-400">{data.plantAreaVolumeDensity} m²/m³</span>
                          </div>
                          <div className="text-zinc-300">
                            Carga de Combustible: <span className="font-mono text-rose-400">{data.fuelDensityKgM3} kg/m³</span>
                          </div>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                {/* Critical RH markers */}
                <ReferenceLine y={gedi.rh98} stroke="#ef4444" strokeDasharray="4 4" label={{ value: `RH98 = ${gedi.rh98}m (Techo Dosel)`, fill: '#ef4444', fontSize: 10, position: 'insideTopRight' }} />
                <ReferenceLine y={gedi.rh75} stroke="#f59e0b" strokeDasharray="3 3" label={{ value: `RH75 = ${gedi.rh75}m`, fill: '#f59e0b', fontSize: 10 }} />
                <ReferenceLine y={gedi.rh50} stroke="#10b981" strokeDasharray="3 3" label={{ value: `RH50 = ${gedi.rh50}m (Altura Media)`, fill: '#10b981', fontSize: 10 }} />
                <ReferenceLine y={gedi.rh25} stroke="#06b6d4" strokeDasharray="3 3" label={{ value: `RH25 = ${gedi.rh25}m (Inicio Copa)`, fill: '#06b6d4', fontSize: 10 }} />

                <Area
                  type="monotone"
                  dataKey="relativeEnergyPct"
                  stroke="#10b981"
                  fill="url(#emeraldGrad)"
                  fillOpacity={0.4}
                  strokeWidth={2.5}
                />
                <defs>
                  <linearGradient id="emeraldGrad" x1="0" y1="0" x2="1" y2="0">
                    <stop offset="0%" stopColor="#10b981" stopOpacity={0.1} />
                    <stop offset="100%" stopColor="#10b981" stopOpacity={0.8} />
                  </linearGradient>
                </defs>
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Plant Area Volume Density (PAVD) Sub-distribution */}
          <div className="mt-4 pt-3 border-t border-zinc-800 grid grid-cols-3 gap-3 text-xs">
            <div className="bg-zinc-950/60 p-3 rounded-lg border border-zinc-800/80">
              <span className="text-zinc-500 uppercase font-mono text-[10px] block mb-1">PAI Total (Índice Foliar)</span>
              <span className="text-lg font-bold font-mono text-emerald-400">{gedi.pai} <span className="text-xs text-zinc-500 font-normal">m²/m²</span></span>
              <div className="h-1 w-full bg-zinc-800 rounded-full overflow-hidden mt-1.5">
                <div className="h-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" style={{ width: '70%' }}></div>
              </div>
            </div>
            <div className="bg-zinc-950/60 p-3 rounded-lg border border-zinc-800/80">
              <span className="text-zinc-500 uppercase font-mono text-[10px] block mb-1">FHD Diversidad Vertical</span>
              <span className="text-lg font-bold font-mono text-sky-400">{gedi.fhd} <span className="text-xs text-zinc-500 font-normal">Shannon</span></span>
              <div className="h-1 w-full bg-zinc-800 rounded-full overflow-hidden mt-1.5">
                <div className="h-full bg-sky-500 shadow-[0_0_8px_rgba(56,189,248,0.5)]" style={{ width: '85%' }}></div>
              </div>
            </div>
            <div className="bg-zinc-950/60 p-3 rounded-lg border border-zinc-800/80">
              <span className="text-zinc-500 uppercase font-mono text-[10px] block mb-1">Cobertura de Copas</span>
              <span className="text-lg font-bold font-mono text-amber-400">{(gedi.cover * 100).toFixed(1)}%</span>
              <div className="h-1 w-full bg-zinc-800 rounded-full overflow-hidden mt-1.5">
                <div className="h-full bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.5)]" style={{ width: `${gedi.cover * 100}%` }}></div>
              </div>
            </div>
          </div>
        </div>

        {/* Right: Stratification & Fuel Bulk Density (CBD) analysis */}
        <div className="lg:col-span-4 space-y-4">
          {/* Quick HUD Vertical Bar Profile */}
          <div className="bg-zinc-900/40 backdrop-blur-md border border-zinc-800 rounded-xl p-4 shadow-xl">
            <h3 className="text-[10px] uppercase tracking-widest text-zinc-500 font-mono mb-3">
              GEDI L4A Vertical Profile (Scan)
            </h3>
            <div className="flex items-end gap-[3px] h-28 bg-zinc-950/80 p-2.5 rounded-lg border border-zinc-800/80">
              <div className="flex-1 bg-emerald-500/20 rounded-t-xs" style={{ height: '20%' }}></div>
              <div className="flex-1 bg-emerald-500/30 rounded-t-xs" style={{ height: '35%' }}></div>
              <div className="flex-1 bg-emerald-500/40 rounded-t-xs" style={{ height: '60%' }}></div>
              <div className="flex-1 bg-emerald-500/60 rounded-t-xs" style={{ height: '85%' }}></div>
              <div className="flex-1 bg-emerald-500/90 shadow-[0_0_10px_rgba(16,185,129,0.4)] rounded-t-xs" style={{ height: '100%' }}></div>
              <div className="flex-1 bg-emerald-500/70 rounded-t-xs" style={{ height: '90%' }}></div>
              <div className="flex-1 bg-emerald-500/50 rounded-t-xs" style={{ height: '50%' }}></div>
              <div className="flex-1 bg-emerald-500/30 rounded-t-xs" style={{ height: '25%' }}></div>
              <div className="flex-1 bg-emerald-500/15 rounded-t-xs" style={{ height: '10%' }}></div>
            </div>
            <div className="flex justify-between text-[9px] mt-1.5 text-zinc-500 font-mono">
              <span>0m</span>
              <span>15m</span>
              <span>30m</span>
              <span>45m</span>
            </div>
          </div>

          {/* Canopy Strata Breakdown */}
          <div className="bg-zinc-900/40 backdrop-blur-md border border-zinc-800 rounded-xl p-4 shadow-xl">
            <div className="flex items-center gap-2 pb-2 border-b border-zinc-800 mb-3 text-zinc-200">
              <Layers className="w-4 h-4 text-emerald-400" />
              <span className="font-semibold text-sm">Estratos Verticales del Dosel</span>
            </div>

            <div className="space-y-2 text-xs">
              {strataInfo.map((stratum, idx) => (
                <div
                  key={idx}
                  className="p-2.5 rounded-lg bg-zinc-950/70 border border-zinc-800/80 hover:border-emerald-500/40 transition-colors"
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-bold text-zinc-200">{stratum.label}</span>
                    <span className="font-mono text-emerald-400 text-[11px] font-semibold">{stratum.range}</span>
                  </div>
                  <p className="text-zinc-400 text-[11px] leading-relaxed">{stratum.desc}</p>
                </div>
              ))}
            </div>
          </div>

          {/* GEDI Algorithm Metadata */}
          <div className="bg-zinc-900/40 backdrop-blur-md border border-zinc-800 rounded-xl p-4 text-xs space-y-3 shadow-xl">
            <div className="flex items-center gap-2 pb-2 border-b border-zinc-800 text-zinc-200">
              <Sparkles className="w-4 h-4 text-sky-400" />
              <span className="font-semibold text-sm">Algoritmo L4A Biomass Calibration</span>
            </div>

            <div className="space-y-1.5 text-zinc-300 font-mono text-[11px] bg-zinc-950/80 p-3 rounded-lg border border-zinc-800">
              <div className="text-emerald-400 font-semibold">AGBD_pred = exp(a0 + a1*sqrt(RH98) + a2*RH50 + a3*RH25)</div>
              <div className="text-zinc-400 mt-1">Biomasa estimada: <span className="text-emerald-300 font-bold">{gedi.agbDensity} Mg C/ha</span></div>
              <div className="text-zinc-400">Error estándar (SE): <span className="text-amber-400">± 12.4 Mg C/ha</span></div>
              <div className="text-zinc-400">Ángulo Solar: <span className="text-sky-300">{gedi.solarElevation}° (Nocturno/Óptimo)</span></div>
            </div>

            <div className="flex items-center gap-2 text-[11px] text-zinc-400">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              <span>Validado contra parcelas permanentes de inventario IFN4.</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
