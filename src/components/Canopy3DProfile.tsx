import React, { useState, useEffect, useTransition } from 'react';
import {
  LandscapeRegion,
  GediMetrics,
  CanopyStratumPoint,
  AGBPredictResponse,
} from '../types';
import {
  MOCK_CANOPY_PROFILE,
  MOCK_GEDI_METRICS,
} from '../data/mockScientificData';
import { ForestTwinAPI } from '../services/api';
import { TreeParametricScene } from './3d/TreeParametricScene';
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
  Box,
  Eye,
  RefreshCw,
  Cpu,
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ReferenceLine,
} from 'recharts';

interface Canopy3DProfileProps {
  region: LandscapeRegion;
}

export const Canopy3DProfile: React.FC<Canopy3DProfileProps> = ({ region }) => {
  const [activeView, setActiveView] = useState<'3d' | '2d' | 'split'>('3d');
  
  // Parámetros telemétricos interactivos
  const [rh98, setRh98] = useState<number>(31.4);
  const [species, setSpecies] = useState<string>(region.dominantSpecies[0] || 'Dipteryx micrantha (Shihuahuaco)');
  const [ndvi, setNdvi] = useState<number>(0.84);
  const [savi, setSavi] = useState<number>(0.66);
  const [ndwi, setNdwi] = useState<number>(0.38);
  const [fmcPct, setFmcPct] = useState<number>(85.0);
  const [vpdKpa, setVpdKpa] = useState<number>(1.12);

  // Toggles de visualización 3D
  const [showWaveform, setShowWaveform] = useState<boolean>(true);
  const [showStratumPlanes, setShowStratumPlanes] = useState<boolean>(true);

  // Estado del modelo de Machine Learning
  const [prediction, setPrediction] = useState<AGBPredictResponse | null>(null);
  const [isInferring, setIsInferring] = useState<boolean>(false);

  // Derivación de métricas alométricas dependientes de RH98
  const cbh = Math.round(rh98 * 0.45 * 10) / 10;
  const rh75 = Math.round(rh98 * 0.82 * 10) / 10;
  const rh50 = Math.round(rh98 * 0.62 * 10) / 10;
  const rh25 = Math.round(rh98 * 0.32 * 10) / 10;

  // Llamada al endpoint backend POST /api/v1/models/predict-agb con debounce
  useEffect(() => {
    let isMounted = true;
    const timer = setTimeout(async () => {
      setIsInferring(true);
      try {
        const res = await ForestTwinAPI.predictAGB({
          rh98_m: rh98,
          ndvi,
          savi,
          ndwi,
          fmc_pct: fmcPct,
          vpd_kpa: vpdKpa,
        });
        if (isMounted) {
          setPrediction(res);
        }
      } catch (err) {
        console.warn('Error en inferencia de biomasa:', err);
      } finally {
        if (isMounted) {
          setIsInferring(false);
        }
      }
    }, 180);

    return () => {
      isMounted = false;
      clearTimeout(timer);
    };
  }, [rh98, ndvi, savi, ndwi, fmcPct, vpdKpa]);

  const liveAGB = prediction ? prediction.agb_pred_mgc_ha : Math.round(Math.pow(rh98 / 2.8, 2) * 10) / 10;
  const liveCiLower = prediction ? prediction.ci_95_lower : Math.max(0, liveAGB - 3.74);
  const liveCiUpper = prediction ? prediction.ci_95_upper : liveAGB + 3.74;

  const gedi = MOCK_GEDI_METRICS;
  const profileData = MOCK_CANOPY_PROFILE;

  const strataInfo = [
    { label: 'Emergentes (>32m)', color: 'from-amber-400 to-emerald-400', range: '32 - 45 m', desc: 'Árboles dominantes longevos, capturan radiación directa, alta densidad leñosa.' },
    { label: 'Dosel Dominante (18-32m)', color: 'from-emerald-500 to-teal-600', range: '18 - 32 m', desc: 'Máxima concentración de índice de área foliar (LAI) y asimilación neta de CO2.' },
    { label: 'Dosel Medio (5-18m)', color: 'from-teal-600 to-emerald-800', range: '5 - 18 m', desc: 'Subestrato intermedio, árboles en fase de competencia y regeneración avanzada.' },
    { label: 'Subdosel (0-5m)', color: 'from-amber-700 to-zinc-700', range: '0 - 5 m', desc: 'Matorral, brinzales y combustible fino superficial (clave para inicio de incendios).' },
    { label: 'Suelo / Retorno Terrestre', color: 'from-zinc-800 to-zinc-900', range: '0 m', desc: 'Pico de energía de referencia altimétrica digital del terreno (DTM).' },
  ];

  return (
    <div className="space-y-4">
      {/* Header Info con selector de modo de visualización */}
      <div className="bg-zinc-900/60 backdrop-blur-md border border-zinc-800 p-4 rounded-xl flex flex-wrap items-center justify-between gap-4 shadow-xl">
        <div>
          <div className="flex items-center gap-2">
            <Radio className="w-5 h-5 text-emerald-400 animate-pulse" />
            <h2 className="text-base font-bold text-zinc-100 uppercase tracking-tight flex items-center gap-2">
              Estructura Vertical del Dosel 3D & Alometría
              <span className="text-[10px] bg-emerald-950/80 text-emerald-400 border border-emerald-800/80 px-2 py-0.5 rounded font-mono font-normal">
                LiDAR GEDI L4A + Stacking ML
              </span>
            </h2>
          </div>
          <p className="text-xs text-zinc-400 mt-1">
            Reconstrucción tridimensional volumétrica y forma de onda de retorno láser de pulso completo en{' '}
            <span className="text-emerald-400 font-semibold">{region.name}</span>.
          </p>
        </div>

        {/* View Mode Switcher */}
        <div className="flex items-center gap-2">
          <div className="bg-zinc-950 p-1 rounded-lg border border-zinc-800 flex items-center gap-1 text-xs">
            <button
              onClick={() => setActiveView('3d')}
              className={`px-3 py-1.5 rounded-md font-medium transition-all flex items-center gap-1.5 ${
                activeView === '3d'
                  ? 'bg-emerald-500 text-zinc-950 font-bold shadow-md'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              <Box className="w-3.5 h-3.5" />
              Gemelo 3D (Three.js)
            </button>
            <button
              onClick={() => setActiveView('split')}
              className={`px-3 py-1.5 rounded-md font-medium transition-all flex items-center gap-1.5 ${
                activeView === 'split'
                  ? 'bg-emerald-500 text-zinc-950 font-bold shadow-md'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              Vista Dividida
            </button>
            <button
              onClick={() => setActiveView('2d')}
              className={`px-3 py-1.5 rounded-md font-medium transition-all flex items-center gap-1.5 ${
                activeView === '2d'
                  ? 'bg-emerald-500 text-zinc-950 font-bold shadow-md'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              <Activity className="w-3.5 h-3.5" />
              Perfil 2D Recharts
            </button>
          </div>
        </div>
      </div>

      {/* Main Content Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Left Column: 3D Scene / 2D Chart */}
        <div className={`${activeView === '3d' ? 'lg:col-span-8' : activeView === 'split' ? 'lg:col-span-8' : 'lg:col-span-8'} flex flex-col gap-4`}>
          
          {/* 3D Scene Container */}
          {(activeView === '3d' || activeView === 'split') && (
            <div className="bg-zinc-900/40 backdrop-blur-md border border-zinc-800 rounded-xl p-4 flex flex-col shadow-2xl">
              <div className="flex items-center justify-between pb-3 border-b border-zinc-800 mb-3 text-xs">
                <div className="flex items-center gap-2">
                  <Box className="w-4 h-4 text-emerald-400" />
                  <span className="font-semibold text-zinc-200 uppercase tracking-wider text-[11px]">
                    Escena Alométrica Paramétrica 3D & Huella Láser GEDI
                  </span>
                  {isInferring && (
                    <span className="flex items-center gap-1 text-[10px] text-amber-400 animate-pulse font-mono">
                      <RefreshCw className="w-3 h-3 animate-spin" /> Inferencia Stacking...
                    </span>
                  )}
                </div>

                {/* 3D Scene Toggles */}
                <div className="flex items-center gap-2 text-xs">
                  <button
                    onClick={() => setShowWaveform(!showWaveform)}
                    className={`px-2.5 py-1 rounded text-[11px] font-mono transition-colors border ${
                      showWaveform
                        ? 'bg-emerald-950/80 text-emerald-300 border-emerald-700'
                        : 'bg-zinc-950 text-zinc-500 border-zinc-800 hover:text-zinc-300'
                    }`}
                  >
                    Nube GEDI {showWaveform ? 'ON' : 'OFF'}
                  </button>
                  <button
                    onClick={() => setShowStratumPlanes(!showStratumPlanes)}
                    className={`px-2.5 py-1 rounded text-[11px] font-mono transition-colors border ${
                      showStratumPlanes
                        ? 'bg-sky-950/80 text-sky-300 border-sky-700'
                        : 'bg-zinc-950 text-zinc-500 border-zinc-800 hover:text-zinc-300'
                    }`}
                  >
                    Métricas RH {showStratumPlanes ? 'ON' : 'OFF'}
                  </button>
                </div>
              </div>

              {/* The 3D Canvas */}
              <div className="h-[460px] w-full">
                <TreeParametricScene
                  rh98={rh98}
                  rh75={rh75}
                  rh50={rh50}
                  rh25={rh25}
                  cbh={cbh}
                  species={species}
                  agb={liveAGB}
                  ciLower={liveCiLower}
                  ciUpper={liveCiUpper}
                  ndvi={ndvi}
                  showWaveform={showWaveform}
                  showStratumPlanes={showStratumPlanes}
                />
              </div>
            </div>
          )}

          {/* 2D Recharts Waveform Container (visible in '2d' or 'split') */}
          {(activeView === '2d' || activeView === 'split') && (
            <div className="bg-zinc-900/40 backdrop-blur-md border border-zinc-800 rounded-xl p-4 flex flex-col shadow-2xl">
              <div className="flex items-center justify-between pb-3 border-b border-zinc-800 mb-4 text-xs">
                <div className="flex items-center gap-2">
                  <Activity className="w-4 h-4 text-sky-400" />
                  <span className="font-semibold text-zinc-200 uppercase tracking-wider text-[11px]">
                    Forma de Onda de Energía Relativa LiDAR P(z)
                  </span>
                  <span className="text-zinc-500 font-mono text-[10px]">Normalizada vs Altura (m)</span>
                </div>
                <div className="flex items-center gap-3 text-[11px] text-zinc-400">
                  <span className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 bg-emerald-500 rounded-sm shadow-[0_0_6px_rgba(16,185,129,0.6)]"></span> Energía (%)
                  </span>
                </div>
              </div>

              <div className="h-80 w-full">
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
                      label={{ value: 'Energía Relativa devuelta por el pulso láser (%)', position: 'insideBottom', offset: -5, fill: '#71717a', fontSize: 11 }}
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
                    <ReferenceLine y={rh98} stroke="#38bdf8" strokeDasharray="4 4" label={{ value: `RH98 = ${rh98}m`, fill: '#38bdf8', fontSize: 10, position: 'insideTopRight' }} />
                    <ReferenceLine y={rh75} stroke="#34d399" strokeDasharray="3 3" label={{ value: `RH75 = ${rh75}m`, fill: '#34d399', fontSize: 10 }} />
                    <ReferenceLine y={rh50} stroke="#a78bfa" strokeDasharray="3 3" label={{ value: `RH50 = ${rh50}m`, fill: '#a78bfa', fontSize: 10 }} />
                    <ReferenceLine y={cbh} stroke="#f59e0b" strokeDasharray="3 3" label={{ value: `CBH = ${cbh}m`, fill: '#f59e0b', fontSize: 10 }} />

                    <Area
                      type="monotone"
                      dataKey="relativeEnergyPct"
                      stroke="#10b981"
                      fill="url(#emeraldGrad2)"
                      fillOpacity={0.4}
                      strokeWidth={2.5}
                    />
                    <defs>
                      <linearGradient id="emeraldGrad2" x1="0" y1="0" x2="1" y2="0">
                        <stop offset="0%" stopColor="#10b981" stopOpacity={0.1} />
                        <stop offset="100%" stopColor="#10b981" stopOpacity={0.8} />
                      </linearGradient>
                    </defs>
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}

          {/* Plant Area Volume Density (PAVD) Sub-distribution */}
          <div className="bg-zinc-900/40 backdrop-blur-md border border-zinc-800 rounded-xl p-4 grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs shadow-xl">
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

        {/* Right Column: Interactive Parameter Sliders & Machine Learning Feedback */}
        <div className="lg:col-span-4 space-y-4">
          
          {/* Sliders Interoceánicos / Telemétricos */}
          <div className="bg-zinc-900/50 backdrop-blur-md border border-zinc-800 rounded-xl p-4 shadow-xl space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-zinc-800 text-zinc-200">
              <div className="flex items-center gap-2">
                <Sliders className="w-4 h-4 text-emerald-400" />
                <span className="font-semibold text-sm">Control Telemétrico del Rodal</span>
              </div>
              <button
                onClick={() => {
                  setRh98(31.4);
                  setNdvi(0.84);
                  setSavi(0.66);
                  setNdwi(0.38);
                  setFmcPct(85.0);
                  setVpdKpa(1.12);
                }}
                className="text-[10px] text-zinc-500 hover:text-zinc-300 font-mono"
                title="Restablecer valores"
              >
                Reset
              </button>
            </div>

            {/* Selector de Especie */}
            <div>
              <label className="text-[11px] font-medium text-zinc-400 block mb-1.5">
                Especie Forestal Dominante (Alometría 3D):
              </label>
              <select
                value={species}
                onChange={(e) => setSpecies(e.target.value)}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-2.5 py-1.5 text-xs text-zinc-200 focus:outline-none focus:border-emerald-500 transition-colors"
              >
                {region.dominantSpecies.map((sp, idx) => (
                  <option key={idx} value={sp}>{sp}</option>
                ))}
                <option value="Bertholletia excelsa (Castaña)">Bertholletia excelsa (Castaña)</option>
                <option value="Dipteryx micrantha (Shihuahuaco)">Dipteryx micrantha (Shihuahuaco)</option>
                <option value="Cedrela odorata (Cedro)">Cedrela odorata (Cedro)</option>
              </select>
            </div>

            {/* Slider RH98 */}
            <div className="space-y-1">
              <div className="flex justify-between text-xs">
                <span className="text-zinc-400">Altura LiDAR RH98:</span>
                <span className="font-mono text-sky-400 font-bold">{rh98.toFixed(1)} m</span>
              </div>
              <input
                type="range"
                min="8.0"
                max="55.0"
                step="0.5"
                value={rh98}
                onChange={(e) => setRh98(parseFloat(e.target.value))}
                className="w-full h-1.5 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-sky-400"
              />
              <div className="flex justify-between text-[10px] text-zinc-600 font-mono">
                <span>8m (Regeneración)</span>
                <span>55m (Mega-emergente)</span>
              </div>
            </div>

            {/* Slider NDVI */}
            <div className="space-y-1">
              <div className="flex justify-between text-xs">
                <span className="text-zinc-400">Vigor Foliar NDVI (Sentinel-2):</span>
                <span className="font-mono text-emerald-400 font-bold">{ndvi.toFixed(2)}</span>
              </div>
              <input
                type="range"
                min="0.20"
                max="0.95"
                step="0.01"
                value={ndvi}
                onChange={(e) => setNdvi(parseFloat(e.target.value))}
                className="w-full h-1.5 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-emerald-400"
              />
            </div>

            {/* Slider Humedad Foliar FMC */}
            <div className="space-y-1">
              <div className="flex justify-between text-xs">
                <span className="text-zinc-400">Humedad de Combustible FMC (%):</span>
                <span className={`font-mono font-bold ${fmcPct < 70 ? 'text-red-400' : 'text-amber-400'}`}>
                  {fmcPct.toFixed(0)}%
                </span>
              </div>
              <input
                type="range"
                min="35"
                max="130"
                step="1"
                value={fmcPct}
                onChange={(e) => setFmcPct(parseFloat(e.target.value))}
                className="w-full h-1.5 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-amber-400"
              />
            </div>

            {/* Slider VPD */}
            <div className="space-y-1">
              <div className="flex justify-between text-xs">
                <span className="text-zinc-400">Déficit Presión Vapor (VPD):</span>
                <span className="font-mono text-rose-400 font-bold">{vpdKpa.toFixed(2)} kPa</span>
              </div>
              <input
                type="range"
                min="0.3"
                max="4.5"
                step="0.05"
                value={vpdKpa}
                onChange={(e) => setVpdKpa(parseFloat(e.target.value))}
                className="w-full h-1.5 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-rose-400"
              />
            </div>
          </div>

          {/* Tarjeta de Inferencia Stacking Híbrido (ML + 3-PG) */}
          <div className="bg-zinc-900/50 backdrop-blur-md border border-zinc-800 rounded-xl p-4 shadow-xl space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-zinc-800 text-zinc-200">
              <div className="flex items-center gap-2">
                <Cpu className="w-4 h-4 text-emerald-400" />
                <span className="font-semibold text-sm">Predicción Stacking ML (FastAPI)</span>
              </div>
              <span className="text-[10px] font-mono text-zinc-500">RMSE = 1.91</span>
            </div>

            <div className="bg-zinc-950 p-3 rounded-lg border border-zinc-800 space-y-2">
              <div className="flex justify-between items-baseline">
                <span className="text-xs text-zinc-400">Biomasa Aérea Predicha:</span>
                <span className="text-xl font-bold font-mono text-emerald-400">
                  {liveAGB.toFixed(1)} <span className="text-xs text-zinc-500 font-normal">Mg C/ha</span>
                </span>
              </div>

              {prediction && (
                <>
                  <div className="flex justify-between text-[11px] text-zinc-400 border-t border-zinc-900 pt-1.5">
                    <span>Estimación 3-PG pura:</span>
                    <span className="font-mono text-zinc-200">{prediction.pure_3pg_estimate_mgc_ha} Mg C/ha</span>
                  </div>
                  <div className="flex justify-between text-[11px] text-zinc-400">
                    <span>Corrección residual ML:</span>
                    <span className={`font-mono ${prediction.hybrid_residual_correction >= 0 ? 'text-emerald-400' : 'text-amber-400'}`}>
                      {prediction.hybrid_residual_correction >= 0 ? '+' : ''}{prediction.hybrid_residual_correction} Mg C/ha
                    </span>
                  </div>
                  <div className="flex justify-between text-[11px] text-zinc-400">
                    <span>Intervalo de Confianza 95%:</span>
                    <span className="font-mono text-sky-400">± 3.74 Mg C/ha</span>
                  </div>
                </>
              )}
            </div>

            <p className="text-[10px] text-zinc-500 leading-relaxed font-mono">
              Modelo: <span className="text-zinc-400">{prediction?.model_version || 'Stacking Híbrido (RF+GBR->RidgeCV)'}</span>
            </p>
          </div>

          {/* Estratos Verticales del Dosel */}
          <div className="bg-zinc-900/50 backdrop-blur-md border border-zinc-800 rounded-xl p-4 shadow-xl">
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

        </div>
      </div>
    </div>
  );
};
